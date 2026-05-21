const GOONG_API_BASE_URL = 'https://rsapi.goong.io';
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY as string | undefined;

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
  };
  status?: string;
};

export const createGoongSessionToken = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const requireApiKey = () => {
  if (!GOONG_API_KEY) {
    throw new Error('Missing VITE_GOONG_API_KEY');
  }

  return GOONG_API_KEY;
};

const buildUrl = (path: string, params: Record<string, string>) => {
  const query = new URLSearchParams(params);
  return `${GOONG_API_BASE_URL}${path}?${query.toString()}`;
};

const goongApi = {
  hasApiKey: Boolean(GOONG_API_KEY),

  async autocomplete(input: string, sessionToken: string, signal?: AbortSignal) {
    const apiKey = requireApiKey();
    const response = await fetch(
      buildUrl('/Place/AutoComplete', {
        api_key: apiKey,
        input,
        limit: '6',
        more_compound: 'true',
        sessiontoken: sessionToken,
      }),
      { signal },
    );

    if (!response.ok) {
      throw new Error('Goong autocomplete request failed');
    }

    const data = (await response.json()) as GoongAutocompleteResponse;
    return data.status === 'OK' ? data.predictions ?? [] : [];
  },

  async getPlaceDetail(placeId: string, sessionToken: string) {
    const apiKey = requireApiKey();
    const response = await fetch(
      buildUrl('/Place/Detail', {
        api_key: apiKey,
        place_id: placeId,
        sessiontoken: sessionToken,
      }),
    );

    if (!response.ok) {
      throw new Error('Goong place detail request failed');
    }

    const data = (await response.json()) as GoongPlaceDetailResponse;
    return data.status === 'OK' ? data.result ?? null : null;
  },
};

export default goongApi;
