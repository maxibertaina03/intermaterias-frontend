import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MensajeError } from "@/components/common/Estados";
import api, { mensajeDeError } from "@/lib/api";
import AuthLayout from "./AuthLayout";
import CampoAuth from "./CampoAuth";
import { usaClerk } from "./clerk";

const VACIO = { empresa: "", nombre: "", apellido: "", email: "", usuario: "", password: "" };

// Prueba gratuita de 30 días: la organizadora crea su empresa y queda como administradora.
// Ruta pública (/registro), fuera del login.
function Formulario({ ingresar }) {
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(null);   // { mensaje } cuando la cuenta quedó creada pero no se pudo entrar solo

  const cambiar = (campo) => (e) => {
    setForm((actual) => ({ ...actual, [campo]: e.target.value }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = {};
    if (form.empresa.trim().length < 2) nuevos.empresa = "Ingresá el nombre de tu empresa";
    if (!form.nombre.trim()) nuevos.nombre = "Ingresá tu nombre";
    if (!/^[a-zA-Z0-9_-]{4,64}$/.test(form.usuario.trim())) nuevos.usuario = "Entre 4 y 64 letras, números, guiones o guiones bajos";
    if (form.password.length < 15) nuevos.password = "Al menos 15 caracteres";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    setError("");
    setGuardando(true);
    try {
      const { data } = await api.post("/publico/registro", {
        ...form, empresa: form.empresa.trim(), usuario: form.usuario.trim().toLowerCase(), email: form.email.trim() || null,
      });
      // Entra directo con la cuenta recién creada; si no se puede, lo manda al login
      const entro = await ingresar(data.usuario, form.password);
      if (entro) window.location.assign("/");
      else setListo(data);
    } catch (err) {
      setError(mensajeDeError(err, "No se pudo completar el registro. Probá de nuevo."));
    } finally {
      setGuardando(false);
    }
  };

  if (listo) {
    return (
      <div className="grid gap-4">
        <p className="flex items-center gap-2 font-medium text-emerald-700"><CheckCircle2 className="size-5" /> {listo.mensaje}</p>
        <p className="text-muted-foreground text-sm">Tu empresa <b>{listo.empresa}</b> ya está creada. Iniciá sesión con tu usuario <b>{listo.usuario}</b>.</p>
        <Button asChild><a href="/">Iniciar sesión</a></Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <CampoAuth id="empresa" label="Nombre de tu empresa" autoFocus autoComplete="organization"
        value={form.empresa} onChange={cambiar("empresa")} error={errores.empresa} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoAuth id="nombre" label="Tu nombre" autoComplete="given-name" value={form.nombre} onChange={cambiar("nombre")} error={errores.nombre} />
        <CampoAuth id="apellido" label="Apellido" autoComplete="family-name" value={form.apellido} onChange={cambiar("apellido")} />
      </div>
      <CampoAuth id="email" label="Email (opcional)" type="email" autoComplete="email" value={form.email} onChange={cambiar("email")} />
      <CampoAuth id="usuario" label="Usuario" autoComplete="username" autoCapitalize="none" spellCheck={false}
        value={form.usuario} onChange={cambiar("usuario")} error={errores.usuario} />
      <CampoAuth id="password" label="Contraseña" type="password" autoComplete="new-password"
        value={form.password} onChange={cambiar("password")} error={errores.password}
        extra={<span className="text-muted-foreground text-xs">15 caracteres o más</span>} />
      {error && <MensajeError>{error}</MensajeError>}
      <Button type="submit" variant="acento" disabled={guardando}>
        {guardando && <Loader2 className="animate-spin" />} Empezar la prueba gratis
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tenés cuenta? <a href="/" className="text-foreground font-medium underline-offset-4 hover:underline">Iniciá sesión</a>
      </p>
    </form>
  );
}

// Con Clerk: después de registrarse, inicia sesión solo
function RegistroConClerk() {
  const { signIn } = useSignIn();
  const ingresar = async (usuario, password) => {
    const { error } = await signIn.password({ identifier: usuario, password });
    if (error || signIn.status !== "complete") return false;
    const { error: e } = await signIn.finalize();
    return !e;
  };
  return <Formulario ingresar={ingresar} />;
}

export default function RegistroPage() {
  return (
    <AuthLayout titulo="Probá gratis 30 días"
      descripcion="Creá la cuenta de tu empresa y usá el sistema completo. Sin tarjeta.">
      {usaClerk ? <RegistroConClerk /> : <Formulario ingresar={async () => false} />}
    </AuthLayout>
  );
}
