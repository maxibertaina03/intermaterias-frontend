import { useState } from "react";
import { useSignUp } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensajeError } from "@/components/common/Estados";
import CampoAuth from "./CampoAuth";
import { errorGlobal, traducir } from "./erroresClerk";

// Alta de la cuenta del personal: nombre, usuario y contraseña.
// La primera vez que entra, el sistema le crea su usuario solo (en la empresa y con los roles por defecto).
export default function CrearCuenta({ irA }) {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [form, setForm] = useState({ nombre: "", apellido: "", usuario: "", password: "" });
  const [codigo, setCodigo] = useState("");
  const [paso, setPaso] = useState("datos"); // datos | codigo
  const [error, setError] = useState("");
  const cargando = fetchStatus === "fetching";
  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleDatos = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signUp.password({
      username: form.usuario.trim(), password: form.password,
      firstName: form.nombre.trim() || undefined, lastName: form.apellido.trim() || undefined,
    });
    if (err) return;
    if (signUp.status === "complete") {
      const { error: e2 } = await signUp.finalize();
      if (e2) setError(traducir(e2, "No se pudo crear la cuenta"));
      return;
    }
    // Solo si la configuración de Clerk pidiera verificar un email
    if (signUp.unverifiedFields?.includes("email_address")) {
      const { error: e2 } = await signUp.verifications.sendEmailCode();
      if (e2) return setError(traducir(e2, "No se pudo enviar el código"));
      return setPaso("codigo");
    }
    setError("Falta completar datos de la cuenta: " + (signUp.missingFields?.join(", ") || "revisá la configuración de Clerk"));
  };

  const handleCodigo = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signUp.verifications.verifyEmailCode({ code: codigo.trim() });
    if (err) return;
    if (signUp.status === "complete") {
      const { error: e2 } = await signUp.finalize();
      if (e2) setError(traducir(e2, "No se pudo crear la cuenta"));
      return;
    }
    setError("Falta completar datos de la cuenta. Avisale al responsable del sistema.");
  };

  const mensaje = error || errorGlobal(errors);

  if (paso === "codigo") {
    return (
      <form onSubmit={handleCodigo} className="grid gap-4">
        <p className="text-muted-foreground text-sm">
          Te mandamos un código por email. Revisá también el spam.
        </p>
        <CampoAuth id="codigo" label="Código de verificación" inputMode="numeric" autoComplete="one-time-code" autoFocus
          value={codigo} onChange={(e) => setCodigo(e.target.value)} error={traducir(errors.fields.code)} />
        {mensaje && <MensajeError>{mensaje}</MensajeError>}
        <Button type="submit" disabled={cargando || !codigo}>{cargando && <Loader2 className="animate-spin" />} Verificar y entrar</Button>
        <Button type="button" variant="ghost" disabled={cargando} onClick={() => signUp.verifications.sendEmailCode()}>Reenviar código</Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleDatos} className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <CampoAuth id="nombre" name="nombre" label="Nombre" autoComplete="given-name" autoFocus
          value={form.nombre} onChange={cambiar} error={traducir(errors.fields.firstName)} />
        <CampoAuth id="apellido" name="apellido" label="Apellido" autoComplete="family-name"
          value={form.apellido} onChange={cambiar} error={traducir(errors.fields.lastName)} />
      </div>
      <CampoAuth id="usuario" name="usuario" label="Usuario" autoComplete="username" autoCapitalize="none" spellCheck={false}
        placeholder="ej: mgomez" value={form.usuario} onChange={cambiar} error={traducir(errors.fields.username)} />
      <CampoAuth id="password" name="password" label="Contraseña" type="password" autoComplete="new-password"
        value={form.password} onChange={cambiar} error={traducir(errors.fields.password)} />
      {/* Lugar para el CAPTCHA anti-bots de Clerk */}
      <div id="clerk-captcha" />
      {mensaje && <MensajeError>{mensaje}</MensajeError>}
      <Button type="submit" disabled={cargando || !form.usuario || !form.password}>
        {cargando && <Loader2 className="animate-spin" />} Crear cuenta
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tenés cuenta?{" "}
        <button type="button" onClick={() => irA("login")} className="text-foreground font-medium underline-offset-4 hover:underline">
          Iniciá sesión
        </button>
      </p>
    </form>
  );
}
