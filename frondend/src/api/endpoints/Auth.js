//base url
const BASE_URL = '/auth';

export const ENDPOINTS_AUTH = {

    SIGNUP: `${BASE_URL}/signup`,
    VERIFY_EMAIL: `${BASE_URL}/verify-email`,
    RESEND_VERIFICATION_EMAIL: `${BASE_URL}/resend-verification`,
    REFRESH_TOKEN: `${BASE_URL}/regenerate-access-token`,
    LOGIN: `${BASE_URL}/login`,
    FGT_PASSWORD: `${BASE_URL}/fgt-password`,
    RESET_PASSWORD: `${BASE_URL}/reset-password`,
    
};
