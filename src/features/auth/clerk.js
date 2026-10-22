// Si hay clave de Clerk en el .env, el login es real. Si no, modo desarrollo
// (el backend usa DEV_ID_USUARIO): sirve para programar sin tener las claves.
export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const usaClerk = Boolean(CLERK_KEY);
