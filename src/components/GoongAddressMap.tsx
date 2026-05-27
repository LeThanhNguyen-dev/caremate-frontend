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
  onSelectLocation?: (location: { latitude: number; longitude: number }) => void;
};

const GoongAddressMap = ({ latitude, longitude, onSelectLocation }: GoongAddressMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapError, setMapError] = useState('');
  const hasLocation = latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasLocation ? { latitude, longitude } : DA_NANG_CENTER;

  useEffect(() => {
    if (!containerRef.current || !GOONG_MAPTILES_KEY) return;

    let map: maplibregl.Map | null = null;
    let loadTimeout = 0;

    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAPTILES_KEY}`,
        center: [center.longitude, center.latitude],
        zoom: hasLocation ? 15 : 11,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.on('load', () => setMapError(''));
      map.on('click', (event) => {
        if (!event.lngLat || !isFiniteCoordinate(event.lngLat.lat) || !isFiniteCoordinate(event.lngLat.lng)) return;

        onSelectLocation?.({
          latitude: Number(event.lngLat.lat.toFixed(6)),
          longitude: Number(event.lngLat.lng.toFixed(6)),
        });
      });

      loadTimeout = window.setTimeout(() => {
        if (map && !map.loaded()) {
          setMapError('Không thể tải bản đồ Goong. Hãy kiểm tra VITE_GOONG_MAPTILES_KEY và domain được phép trong Goong Console.');
        }
      }, 7000);

      mapRef.current = map;
    } catch {
      setMapError('Không thể khởi tạo bản đồ Goong.');
    }

    return () => {
      window.clearTimeout(loadTimeout);
      markerRef.current?.remove();
      markerRef.current = null;
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    try {
      map.flyTo({
        center: [center.longitude, center.latitude],
        zoom: hasLocation ? 15 : 11,
        essential: true,
      });

      if (hasLocation) {
        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({ color: '#EC4899' }).addTo(map);
        }

        markerRef.current.setLngLat([center.longitude, center.latitude]);
      } else {
        markerRef.current?.remove();
        markerRef.current = null;
      }
    } catch {
      setMapError('Không thể cập nhật vị trí trên bản đồ Goong.');
    }
  }, [center.latitude, center.longitude, hasLocation]);

  if (!GOONG_MAPTILES_KEY) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold leading-6 text-slate-400">
        Thêm VITE_GOONG_MAPTILES_KEY để bật bản đồ Goong.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 shadow-inner">
      <div className="relative">
        <div ref={containerRef} className="h-[320px] w-full" />
        {mapError && (
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 text-sm font-semibold leading-6 text-slate-600 shadow-xl">
            {mapError}
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 bg-white px-5 py-3 text-xs font-semibold text-slate-500">
        Chọn địa chỉ bằng Goong hoặc click trên bản đồ để cập nhật tọa độ.
      </div>
    </div>
  );
};

export default GoongAddressMap;
