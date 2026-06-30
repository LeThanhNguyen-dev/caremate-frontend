import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let initialized = false;

export const initGA = () => {
    if (initialized || !GA_MEASUREMENT_ID) return;
    ReactGA.initialize(GA_MEASUREMENT_ID);
    initialized = true;
};

export const trackPageView = (path: string, title?: string) => {
    if (!initialized) return;
    ReactGA.send({ hitType: 'pageview', page: path, title });
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
    if (!initialized) return;
    ReactGA.event({ category, action, label, value });
};
