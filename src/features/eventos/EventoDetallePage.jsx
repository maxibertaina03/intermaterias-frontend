// Detalle de un evento (Responsable: Lucas). Cada pestaña es de un integrante distinto:
// así cada uno trabaja en su archivo sin pisarse. No mover las pestañas a este archivo.
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/common/PageHeader";
import PropuestaTab from "@/features/propuestas/PropuestaTab";
import ServiciosAcordadosTab from "@/features/coordinacion/ServiciosAcordadosTab";
import TareasTab from "@/features/tareas/TareasTab";
import CambiosTab from "@/features/eventos/CambiosTab";

export default function EventoDetallePage() {
  const { id } = useParams();
  // TODO (Lucas): cargar el evento con GET /api/eventos/:id y mostrar sus datos arriba de las pestañas
  const evento = { id_evento: Number(id) };

  return (
    <>
      <PageHeader titulo={`Evento #${id}`} descripcion="Datos, propuesta, servicios, tareas y cambios." />
      <Tabs defaultValue="propuesta">
        <TabsList>
          <TabsTrigger value="propuesta">Propuesta</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="cambios">Cambios</TabsTrigger>
        </TabsList>
        <TabsContent value="propuesta"><PropuestaTab evento={evento} /></TabsContent>
        <TabsContent value="servicios"><ServiciosAcordadosTab evento={evento} /></TabsContent>
        <TabsContent value="tareas"><TareasTab evento={evento} /></TabsContent>
        <TabsContent value="cambios"><CambiosTab evento={evento} /></TabsContent>
      </Tabs>
    </>
  );
}
