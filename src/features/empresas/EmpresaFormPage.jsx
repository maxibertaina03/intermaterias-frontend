// EJEMPLO DE REFERENCIA: formulario de crear/editar con shadcn. Copiar este patrón.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/common/PageHeader";
import Campo from "@/components/common/Campo";
import { Cargando, MensajeError } from "@/components/common/Estados";
import { mensajeDeError } from "@/lib/api";
import { actualizarEmpresa, crearEmpresa, obtenerEmpresa } from "./empresasService";

const CAMPOS = [
  { name: "nombre", label: "Nombre", requerido: true },
  { name: "cuit", label: "CUIT", requerido: true },   // obligatorio al crear; las de prueba gratuita pueden no tenerlo
  { name: "email", label: "Email", type: "email" },
  { name: "telefono", label: "Teléfono", type: "tel" },
  { name: "direccion", label: "Dirección" },
];
const VACIO = { nombre: "", cuit: "", email: "", telefono: "", direccion: "", fecha_fin_prueba: "" };

export default function EmpresaFormPage() {
  const { id } = useParams();                 // si hay id: editar; si no: crear
  const navigate = useNavigate();
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(Boolean(id));
  const [errorCarga, setErrorCarga] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) return;
    obtenerEmpresa(id)
      .then(({ data }) => setForm({
        nombre: data.nombre ?? "", cuit: data.cuit ?? "", email: data.email ?? "",
        telefono: data.telefono ?? "", direccion: data.direccion ?? "",
        fecha_fin_prueba: data.fecha_fin_prueba ? data.fecha_fin_prueba.slice(0, 10) : "",
      }))
      .catch((e) => setErrorCarga(e.response?.status === 404 ? "Empresa no encontrada" : mensajeDeError(e, "No se pudo cargar la empresa")))
      .finally(() => setCargando(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevos = {};
    if (!form.nombre.trim()) nuevos.nombre = "El nombre es obligatorio";
    if (!id && !form.cuit.trim()) nuevos.cuit = "El CUIT es obligatorio";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;

    // Los opcionales vacíos se mandan como null
    const { fecha_fin_prueba, ...resto } = form;
    const datos = {
      ...resto, cuit: form.cuit.trim() || null, email: form.email || null, telefono: form.telefono || null, direccion: form.direccion || null,
      // Al editar: fin de la prueba gratuita (vacío = sin límite)
      ...(id ? { fecha_fin_prueba: fecha_fin_prueba || null } : {}),
    };
    setGuardando(true);
    try {
      if (id) await actualizarEmpresa(id, datos);
      else await crearEmpresa(datos);
      toast.success(id ? "Cambios guardados" : "Empresa creada");
      navigate("/empresas");
    } catch (error) {
      toast.error(mensajeDeError(error, "No se pudo guardar la empresa"));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Cargando />;
  if (errorCarga) return (
    <div className="space-y-4">
      <MensajeError>{errorCarga}</MensajeError>
      <Button variant="outline" asChild><Link to="/empresas">Volver al listado</Link></Button>
    </div>
  );

  return (
    <>
      <PageHeader titulo={id ? "Editar empresa" : "Nueva empresa"} />
      <Card className="max-w-xl">
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="grid gap-4">
            {CAMPOS.map(({ name, label, type = "text", requerido }) => (
              <Campo key={name} id={name} label={label} requerido={requerido && !(id && name === "cuit")} error={errores[name]}>
                <Input id={name} name={name} type={type} value={form[name]} onChange={handleChange}
                  aria-invalid={Boolean(errores[name])} />
              </Campo>
            ))}
            {id && (
              <Campo id="fecha_fin_prueba" label="Fin de la prueba gratuita">
                <Input id="fecha_fin_prueba" name="fecha_fin_prueba" type="date" value={form.fecha_fin_prueba} onChange={handleChange} />
                <p className="text-muted-foreground mt-1 text-xs">Vacío = sin límite (empresa con suscripción o dada de alta por vos).</p>
              </Campo>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/empresas")}>Cancelar</Button>
              <Button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : id ? "Guardar cambios" : "Crear empresa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
