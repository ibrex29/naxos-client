/**
 * Api detail
 */


export const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://198.38.82.20:8001/v1';

export const authUrl = `${baseUrl}/auth/login`