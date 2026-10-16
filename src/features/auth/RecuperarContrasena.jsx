import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensajeError } from "@/components/common/Estados";
import CampoAuth from "./CampoAuth";
import { errorGlobal, traducir } from "./erroresClerk";

// Olvidé mi contraseña: email → código por email → contraseña nueva.
export default function RecuperarContrasena({ irA }) {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [paso, setPaso] = useState("email"); // email | codigo | nueva
  const [error, setError] = useState("");
  const cargando = fetchStatus === "fetching";

  const enviarCodigo = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signIn.create({ identifier: email.trim() });
    if (err) return;
    const { error: e2 } = await signIn.resetPasswordEmailCode.sendCode();
    if (e2) return setError(traducir(e2, "No se pudo enviar el código"));
    setPaso("codigo");
  };

  const verificar = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signIn.resetPasswordEmailCode.verifyCode({ code: codigo.trim() });
    if (!err) setPaso("nueva");
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (err) return;
    if (signIn.status === "complete") {
      const { error: e2 } = await signIn.finalize();
      if (e2) setError(traducir(e2, "No se pudo iniciar sesión"));
    }
  };

  const mensaje = error || errorGlobal(errors);
  const volver = (
    <button type="button" onClick={() => irA("login")} className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline">
      Volver a iniciar sesión
    </button>
  );

  if (paso === "nueva") return (
    <form onSubmit={guardar} className="grid gap-4">
      <CampoAuth id="password" label="Contraseña nueva" type="password" autoComplete="new-password" autoFocus
        value={password} onChange={(e) => setPassword(e.target.value)} error={traducir(errors.fields.password)} />
      {mensaje && <MensajeError>{mensaje}</MensajeError>}
      <Button type="submit" disabled={cargando || !password}>{cargando && <Loader2 className="animate-spin" />} Guardar y entrar</Button>
    </form>
  );

  if (paso === "codigo") return (
    <form onSubmit={verificar} className="grid gap-4">
      <p className="text-muted-foreground text-sm">Ingresá el código que te mandamos a <span className="text-foreground font-medium">{email}</span>.</p>
      <CampoAuth id="codigo" label="Código" inputMode="numeric" autoComplete="one-time-code" autoFocus
        value={codigo} onChange={(e) => setCodigo(e.target.value)} error={traducir(errors.fields.code)} />
      {mensaje && <MensajeError>{mensaje}</MensajeError>}
      <Button type="submit" disabled={cargando || !codigo}>{cargando && <Loader2 className="animate-spin" />} Continuar</Button>
      {volver}
    </form>
  );

  return (
    <form onSubmit={enviarCodigo} className="grid gap-4">
      <CampoAuth id="email" label="Email" type="email" autoComplete="email" autoFocus placeholder="nombre@empresa.com"
        value={email} onChange={(e) => setEmail(e.target.value)} error={traducir(errors.fields.identifier)} />
      {mensaje && <MensajeError>{mensaje}</MensajeError>}
      <Button type="submit" disabled={cargando || !email}>{cargando && <Loader2 className="animate-spin" />} Enviar código</Button>
      {volver}
    </form>
  );
}
