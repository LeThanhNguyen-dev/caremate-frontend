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
  predictions?: GoongPrediction[];
  status?: string;
};

type GoongPlaceDetailResponse = {
  result?: {
    formatted_address?: string;
    name?: string;
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
    compound?: {
      commune?: string;
      district?: string;
      province?: string;
    };
  };
  status?: string;
};

export type GoongPlaceDetail = NonNullable<GoongPlaceDetailResponse['result']>;

export const extractGoongAddressParts = (detail: GoongPlaceDetail | null, fallbackAddress = '') => {
  const formattedAddress = detail?.formatted_address || fallbackAddress;
  const segments = formattedAddress
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean);

  const fallbackWard = segments.find((segment) => /^(phường|xã|thị trấn)\s/i.test(segment));
  const fallbackDistrict = segments.find((segment) => /^(quận|huyện|thị xã|thành phố)\s/i.test(segment));

  return {
    fullAddress: formattedAddress,
    ward: detail?.compound?.commune || fallbackWard || '',
    district: detail?.compound?.district || fallbackDistrict?.replace(/^(quận|huyện|thị xã|thành phố)\s/i, '') || '',
    latitude: detail?.geometry?.location?.lat ?? null,
    longitude: detail?.geometry?.location?.lng ?? null,
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
    return data.status === 'OK' ? data.predictions ?? [] : [];
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
