/**
 * Api detail
 */


export const baseUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? 'https://alumni.slu.edu.ng';

export const authUrl = `${baseUrl}/v1/auth/login`