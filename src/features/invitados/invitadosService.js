import api from "@/lib/api";

export const obtenerInvitacionPublica = (token) => api.get(`/publico/invitaciones/${token}`);
export const responderInvitacion = (token, formulario) =>
  api.post(`/publico/invitaciones/${token}/respuestas`, formulario);
export const obtenerInvitadosEvento = (idEvento) => api.get(`/eventos/${idEvento}/invitados`);
export const guardarInvitacionEvento = (idEvento, datos) => api.post(`/eventos/${idEvento}/invitacion`, datos);
export const verificarPagoInvitado = (idInvitado) => api.patch(`/invitados/${idInvitado}/verificar`);
export const obtenerComprobanteInvitado = (idInvitado) =>
  api.get(`/invitados/${idInvitado}/comprobante`, { responseType: "blob" });
