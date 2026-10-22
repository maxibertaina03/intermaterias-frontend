// La API de Clerk devuelve los errores en inglés: acá se traducen por código.
const MENSAJES = {
  form_identifier_not_found: "No hay ninguna cuenta con ese usuario",
  form_password_incorrect: "La contraseña es incorrecta",
  form_password_pwned: "Esa contraseña apareció en filtraciones de datos. Elegí otra",
  form_password_length_too_short: "La contraseña tiene que tener al menos 15 caracteres",
  form_password_not_strong_enough: "La contraseña es muy débil",
  form_password_validation_failed: "La contraseña no es válida",
  form_identifier_exists: "Ese usuario ya está en uso. Elegí otro",
  form_username_invalid_character: "El usuario solo puede tener letras, números, guiones y guión bajo",
  form_username_invalid_length: "El usuario tiene que tener entre 4 y 64 caracteres",
  form_param_format_invalid: "El formato no es válido",
  form_param_nil: "Completá este campo",
  form_param_missing: "Completá este campo",
  form_code_incorrect: "El código es incorrecto",
  verification_expired: "El código venció. Pedí uno nuevo",
  verification_failed: "No se pudo verificar el código",
  too_many_requests: "Demasiados intentos. Esperá un momento y probá de nuevo",
  session_exists: "Ya hay una sesión iniciada",
  strategy_for_user_invalid: "Esta cuenta no puede iniciar sesión con contraseña",
  user_banned: "Tu usuario está desactivado. Hablá con el administrador de tu empresa",
  captcha_invalid: "No se pudo verificar que no seas un robot. Recargá la página",
};

export const traducir = (error, porDefecto = "") =>
  error ? MENSAJES[error.code] || error.longMessage || error.message || porDefecto : "";

// Primer error "global" (no de un campo) del hook de Clerk, ya traducido
export const errorGlobal = (errors) => traducir(errors?.global?.[0]);
