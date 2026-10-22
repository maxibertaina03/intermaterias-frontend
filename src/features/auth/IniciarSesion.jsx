import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensajeError } from "@/components/common/Estados";
import CampoAuth from "./CampoAuth";
import { errorGlobal, traducir } from "./erroresClerk";

// Usuario + contraseña (Clerk). Si Clerk pidiera verificar el dispositivo, pide el código.
export default function IniciarSesion({ irA }) {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pideCodigo, setPideCodigo] = useState(false);
  const [error, setError] = useState("");
  const cargando = fetchStatus === "fetching";

  const terminar = async () => {
    const { error: e } = await signIn.finalize();
    if (e) setError(traducir(e, "No se pudo iniciar sesión"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signIn.password({ identifier: usuario.trim(), password });
    if (err) return;                                    // los errores de campo los muestra el formulario
    if (signIn.status === "complete") return terminar();
    if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
      const { error: e2 } = await signIn.mfa.sendEmailCode();
      if (e2) return setError(traducir(e2, "No se pudo enviar el código"));
      return setPideCodigo(true);
    }
    setError("No se pudo iniciar sesión. Probá de nuevo.");
  };

  const handleCodigo = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signIn.mfa.verifyEmailCode({ code: codigo.trim() });
    if (err) return;
    if (signIn.status === "complete") return terminar();
    setError("No se pudo verificar el código.");
  };

  if (pideCodigo) {
    return (
      <form onSubmit={handleCodigo} className="grid gap-4">
        <p className="text-muted-foreground text-sm">
          Te mandamos un código para confirmar que sos vos.
        </p>
        <CampoAuth id="codigo" label="Código" inputMode="numeric" autoComplete="one-time-code" autoFocus
          value={codigo} onChange={(e) => setCodigo(e.target.value)} error={traducir(errors.fields.code)} />
        {(error || errorGlobal(errors)) && <MensajeError>{error || errorGlobal(errors)}</MensajeError>}
        <Button type="submit" disabled={cargando || !codigo}>{cargando && <Loader2 className="animate-spin" />} Verificar</Button>
        <Button type="button" variant="ghost" onClick={() => setPideCodigo(false)}>Volver</Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <CampoAuth id="usuario" label="Usuario" autoComplete="username" autoFocus autoCapitalize="none" spellCheck={false}
        value={usuario} onChange={(e) => setUsuario(e.target.value)} error={traducir(errors.fields.identifier)} />
      <CampoAuth id="password" label="Contraseña" type="password" autoComplete="current-password"
        value={password} onChange={(e) => setPassword(e.target.value)} error={traducir(errors.fields.password)} />
      {(error || errorGlobal(errors)) && <MensajeError>{error || errorGlobal(errors)}</MensajeError>}
      <Button type="submit" disabled={cargando || !usuario || !password}>
        {cargando && <Loader2 className="animate-spin" />} Iniciar sesión
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        ¿Primera vez?{" "}
        <button type="button" onClick={() => irA("registro")} className="text-foreground font-medium underline-offset-4 hover:underline">
          Creá tu cuenta
        </button>
      </p>
    </form>
  );
}
