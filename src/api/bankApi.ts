import axios from 'axios';
import type { BankOptionDto } from './frontend-api-contract';

type VietQrBankResponse = {
  code: string;
  data: Array<{
    code: string;
    name: string;
    shortName?: string;
    bin?: string;
  }>;
};

export const bankApi = {
  getBanks: async (): Promise<BankOptionDto[]> => {
    const response = await axios.get<VietQrBankResponse>('https://api.vietqr.io/v2/banks');
    return (response.data.data || []).map((item) => ({
      code: item.code,
      name: item.name,
      shortName: item.shortName ?? null,
      bin: item.bin ?? null,
    }));
  },
};

export default bankApi;
