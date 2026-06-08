import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const GOONG_MAPTILES_KEY = import.meta.env.VITE_GOONG_MAPTILES_KEY as string | undefined;
const DA_NANG_CENTER = { latitude: 16.0544, longitude: 108.2022 };

const isFiniteCoordinate = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

type GoongAddressMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  heightClassName?: string;
  helperText?: string;
  onSelectLocation?: (location: { latitude: number; longitude: number }) => void;
};

const toLocation = (lngLat: maplibregl.LngLat) => ({
  latitude: Number(lngLat.lat.toFixed(6)),
  longitude: Number(lngLat.lng.toFixed(6)),
});

const GoongAddressMap = ({
  latitude,
  longitude,
  heightClassName = 'h-[320px]',
  helperText = 'Keo ban do hoac click de chon vi tri duoi ghim.',
  onSelectLocation,
}: GoongAddressMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onSelectLocationRef = useRef(onSelectLocation);
  const loadedRef = useRef(false);
  const userMovedMapRef = useRef(false);
  const skipNextMoveEndRef = useRef(false);
  const [mapError, setMapError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const hasLocation = latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasLocation ? { latitude, longitude } : DA_NANG_CENTER;

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const syncMapLocation = () => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;

    try {
      map.resize();
      map.stop();
      skipNextMoveEndRef.current = true;
      map.easeTo({
        center: [center.longitude, center.latitude],
        zoom: hasLocation ? Math.max(map.getZoom(), 16) : 11,
        essential: true,
        duration: 350,
      });
      setMapError('');
    } catch (error) {
      console.warn('Unable to sync Goong map location.', error);
    }
  };

  const selectCurrentCenter = () => {
    const map = mapRef.current;
    if (!map) return;

    const location = toLocation(map.getCenter());
    onSelectLocationRef.current?.(location);
  };

  useEffect(() => {
    if (!containerRef.current || !GOONG_MAPTILES_KEY) return;

    let map: maplibregl.Map | null = null;
    let loadTimeout = 0;
    let resizeObserver: ResizeObserver | null = null;

    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`,
        center: [center.longitude, center.latitude],
        zoom: hasLocation ? 16 : 11,
        attributionControl: false,
        dragPan: true,
        scrollZoom: true,
        touchZoomRotate: true,
      });

      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.getCanvas().style.cursor = 'grab';

      map.on('load', () => {
        loadedRef.current = true;
        setMapLoaded(true);
        setMapError('');
        window.clearTimeout(loadTimeout);
        map?.resize();
      });

      map.on('dragstart', () => {
        userMovedMapRef.current = true;
        mapRef.current?.getCanvas().style.setProperty('cursor', 'grabbing');
      });

      map.on('dragend', () => {
        mapRef.current?.getCanvas().style.setProperty('cursor', 'grab');
      });

      map.on('moveend', () => {
        if (skipNextMoveEndRef.current) {
          skipNextMoveEndRef.current = false;
          return;
        }

        if (!userMovedMapRef.current) return;
        userMovedMapRef.current = false;
        selectCurrentCenter();
      });

      map.on('click', (event) => {
        const activeMap = mapRef.current;
        if (!activeMap || !event.lngLat || !isFiniteCoordinate(event.lngLat.lat) || !isFiniteCoordinate(event.lngLat.lng)) return;

        const location = toLocation(event.lngLat);
        skipNextMoveEndRef.current = true;
        activeMap.easeTo({
          center: [location.longitude, location.latitude],
          zoom: Math.max(activeMap.getZoom(), 16),
          essential: true,
          duration: 300,
        });
        setMapError('');
        onSelectLocationRef.current?.(location);
      });

      resizeObserver = new ResizeObserver(() => {
        mapRef.current?.resize();
      });
      resizeObserver.observe(containerRef.current);

      loadTimeout = window.setTimeout(() => {
        if (map && !loadedRef.current) {
          setMapError('Khong the tai ban do Goong. Hay kiem tra VITE_GOONG_MAPTILES_KEY va domain trong Goong Console.');
        }
      }, 7000);
    } catch {
      setMapError('Khong the khoi tao ban do Goong.');
    }

    return () => {
      window.clearTimeout(loadTimeout);
      resizeObserver?.disconnect();
      loadedRef.current = false;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    syncMapLocation();
  }, [center.latitude, center.longitude, hasLocation, mapLoaded]);

  if (!GOONG_MAPTILES_KEY) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold leading-6 text-slate-400">
        Them VITE_GOONG_MAPTILES_KEY de bat ban do Goong.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 shadow-inner">
      <div className="relative">
        <div ref={containerRef} className={`${heightClassName} w-full`} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
          <div className="relative grid h-8 w-8 place-items-center rounded-full bg-[#EC4899] text-white shadow-[0_8px_18px_rgba(236,72,153,0.32)] ring-[3px] ring-white">
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
            <div className="absolute left-1/2 top-[24px] h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-[#EC4899]" />
          </div>
        </div>
        {mapError && (
          <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl bg-white/95 p-4 text-sm font-semibold leading-6 text-slate-600 shadow-xl">
            {mapError}
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 bg-white px-5 py-3 text-xs font-semibold text-slate-500">
        {helperText}
      </div>
    </div>
  );
};

export default GoongAddressMap;
