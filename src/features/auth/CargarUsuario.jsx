import { useEffect, useState } from "react";
import api, { mensajeDeError } from "@/lib/api";
import { Cargando, MensajeError } from "@/components/common/Estados";
import SinAccesoPage from "./SinAccesoPage";
import { UsuarioContext } from "./UsuarioContext";

// Pide GET /api/me y deja el usuario disponible para toda la app.
export default function CargarUsuario({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estado, setEstado] = useState("cargando"); // cargando | ok | sin_acceso | error
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/me")
      .then(({ data }) => { setUsuario(data); setEstado("ok"); })
      .catch((e) => {
        if (e.response?.status === 403) setEstado("sin_acceso");
        else { setError(mensajeDeError(e, "No se pudo conectar con el servidor")); setEstado("error"); }
      });
  }, []);

  if (estado === "cargando") return <div className="mx-auto max-w-md p-10"><Cargando /></div>;
  if (estado === "sin_acceso") return <SinAccesoPage />;
  if (estado === "error") return <div className="mx-auto max-w-md p-10"><MensajeError>{error}</MensajeError></div>;
  return <UsuarioContext.Provider value={usuario}>{children}</UsuarioContext.Provider>;
}
