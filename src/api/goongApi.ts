import axiosInstance from './axios';

export type GoongPrediction = {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type GoongAutocompleteResponse = {
  predictions?: Array<Partial<GoongPrediction>>;
  status?: string;
};

type GoongPlaceDetailResponse = {
  result?: {
    formatted_address?: string;
    name?: string;
    geometry?: {
      location?: {
        lat?: number | string;
        lng?: number | string;
      };
    };
    compound?: {
      commune?: unknown;
      district?: unknown;
      province?: unknown;
    };
  };
  status?: string;
};

export type GoongPlaceDetail = NonNullable<GoongPlaceDetailResponse['result']>;

const toText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const toFiniteNumber = (value: unknown) => {
  const numberValue = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(numberValue) ? numberValue : null;
};

const findAddressSegment = (segments: string[], prefixes: string[]) =>
  segments.find((segment) => {
    const normalized = segment.toLocaleLowerCase('vi-VN');
    return prefixes.some((prefix) => normalized.startsWith(prefix));
  }) || '';

const removeDistrictPrefix = (district: string) =>
  district
    .replace(/^(quận|huyện|thị xã|thành phố|quan|huyen|thi xa|thanh pho)\s+/i, '')
    .trim();

const isAdminSegment = (segment: string) => {
  const normalized = segment.toLocaleLowerCase('vi-VN');
  return [
    'phường',
    'xã',
    'thị trấn',
    'quận',
    'huyện',
    'thị xã',
    'thành phố',
    'đà nẵng',
    'việt nam',
    'phuong',
    'xa',
    'thi tran',
    'quan',
    'huyen',
    'thi xa',
    'thanh pho',
    'da nang',
    'viet nam',
  ].some((prefix) => normalized.startsWith(prefix) || normalized === prefix);
};

const normalizePrediction = (prediction: Partial<GoongPrediction>): GoongPrediction | null => {
  const description = toText(prediction.description);
  const placeId = toText(prediction.place_id);

  if (!description || !placeId) return null;

  return {
    description,
    place_id: placeId,
    structured_formatting: {
      main_text: toText(prediction.structured_formatting?.main_text),
      secondary_text: toText(prediction.structured_formatting?.secondary_text),
    },
  };
};

export const extractGoongAddressParts = (detail: GoongPlaceDetail | null, fallbackAddress = '') => {
  const formattedAddress = toText(detail?.formatted_address) || fallbackAddress;
  const segments = formattedAddress
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const fallbackWard = findAddressSegment(segments, ['phường', 'xã', 'thị trấn', 'phuong', 'xa', 'thi tran']);
  const fallbackDistrict = findAddressSegment(segments, ['quận', 'huyện', 'thị xã', 'thành phố', 'quan', 'huyen', 'thi xa', 'thanh pho']);
  const compoundWard = toText(detail?.compound?.commune);
  const compoundDistrict = toText(detail?.compound?.district);
  const streetAddress = segments.filter((segment) => !isAdminSegment(segment)).join(', ');

  return {
    fullAddress: formattedAddress,
    streetAddress,
    ward: compoundWard || fallbackWard,
    district: compoundDistrict || removeDistrictPrefix(fallbackDistrict),
    latitude: toFiniteNumber(detail?.geometry?.location?.lat),
    longitude: toFiniteNumber(detail?.geometry?.location?.lng),
  };
};

export const createGoongSessionToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const goongApi = {
  hasApiKey: true,

  async autocomplete(input: string, sessionToken: string, signal?: AbortSignal) {
    const response = await axiosInstance.get<GoongAutocompleteResponse>(
      '/api/goong/autocomplete',
      {
        params: {
          input,
          sessionToken,
        },
        signal,
      },
    );

    const data = response.data;
    return data.status === 'OK' ? (data.predictions ?? []).map(normalizePrediction).filter((item): item is GoongPrediction => item != null) : [];
  },

  async getPlaceDetail(placeId: string, sessionToken: string) {
    const response = await axiosInstance.get<GoongPlaceDetailResponse>(
      '/api/goong/place-detail',
      {
        params: {
          placeId,
          sessionToken,
        },
      },
    );

    const data = response.data;
    return data.status === 'OK' ? data.result ?? null : null;
  },
};

export default goongApi;
