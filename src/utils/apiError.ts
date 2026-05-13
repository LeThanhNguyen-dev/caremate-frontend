import { AxiosError } from 'axios';

type ErrorPayload = {
    message?: string;
    Message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof AxiosError) {
        const payload = error.response?.data as ErrorPayload | string | undefined;
        if (typeof payload === 'string' && payload.trim()) {
            return payload;
        }
        if (payload && typeof payload === 'object') {
            return payload.message || payload.Message || fallback;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};
