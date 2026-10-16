import { useState } from "react";
import { useSignUp } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensajeError } from "@/components/common/Estados";
import CampoAuth from "./CampoAuth";
import { errorGlobal, traducir } from "./erroresClerk";

// Alta de la cuenta del personal. Tiene que usar el MISMO email con el que la empresa lo cargó:
// así el sistema lo reconoce (alta por email).
export default function CrearCuenta({ irA }) {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", password: "" });
  const [codigo, setCodigo] = useState("");
  const [paso, setPaso] = useState("datos"); // datos | codigo
  const [error, setError] = useState("");
  const cargando = fetchStatus === "fetching";
  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleDatos = async (e) => {
    e.preventDefault();
    setError("");
    const { error: err } = await signUp.password({
      emailAddress: form.email.trim(), password: form.password,
      firstName: form.nombre.trim() || undefined, lastName: form.apellido.trim() || undefined,
    });
    if (err) return;
    const { error: e2 } = await signUp.verifications.sendEmailCode();
    if (e2) return setError(traducir(e2, "No se pudo enviar el código"));
    setPaso("codigo");
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
          Te mandamos un código a <span className="text-foreground font-medium">{form.email}</span>. Revisá también el spam.
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
      <CampoAuth id="email" name="email" label="Email" type="email" autoComplete="email" placeholder="nombre@empresa.com"
        value={form.email} onChange={cambiar} error={traducir(errors.fields.emailAddress)} />
      <CampoAuth id="password" name="password" label="Contraseña" type="password" autoComplete="new-password"
        value={form.password} onChange={cambiar} error={traducir(errors.fields.password)} />
      <p className="text-muted-foreground -mt-2 text-xs">Usá el mismo email con el que te dieron de alta en la empresa.</p>
      {/* Lugar para el CAPTCHA anti-bots de Clerk */}
      <div id="clerk-captcha" />
      {mensaje && <MensajeError>{mensaje}</MensajeError>}
      <Button type="submit" disabled={cargando || !form.email || !form.password}>
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
