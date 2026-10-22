import { Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import NoEncontrada from "@/pages/NoEncontrada";
import { SoloEmpresa, SoloSuperAdmin } from "@/features/auth/RutasPorPerfil";
// Seguimiento (Tomi)
import PendientesPage from "@/features/tareas/PendientesPage";
import TareasPage from "@/features/tareas/TareasPage";
// Encargos (Lucas / Tomi)
import EventosPage from "@/features/eventos/EventosPage";
import EventoFormPage from "@/features/eventos/EventoFormPage";
import EventoDetallePage from "@/features/eventos/EventoDetallePage";
import ClientesPage from "@/features/clientes/ClientesPage";
import ClienteDetallePage from "@/features/clientes/ClienteDetallePage";
import PropuestasPage from "@/features/propuestas/PropuestasPage";
// Catálogos (Facu)
import ServiciosPage from "@/features/catalogos/ServiciosPage";
import ProveedoresPage from "@/features/catalogos/ProveedoresPage";
import SedesPage from "@/features/catalogos/SedesPage";
import TiposEventoPage from "@/features/catalogos/TiposEventoPage";
// Administración (ejemplo de referencia)
import EmpresasPage from "@/features/empresas/EmpresasPage";
import EmpresaFormPage from "@/features/empresas/EmpresaFormPage";

// Todas las rutas ya están registradas: cada uno completa su página, sin tocar este archivo.
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Datos de la empresa del usuario (el super admin va a Empresas) */}
        <Route element={<SoloEmpresa />}>
          <Route path="/" element={<PendientesPage />} />
          <Route path="/tareas" element={<TareasPage />} />

          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/eventos/nuevo" element={<EventoFormPage />} />
          <Route path="/eventos/:id" element={<EventoDetallePage />} />
          <Route path="/eventos/:id/editar" element={<EventoFormPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/clientes/:id" element={<ClienteDetallePage />} />
          <Route path="/propuestas" element={<PropuestasPage />} />

          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/proveedores" element={<ProveedoresPage />} />
          <Route path="/sedes" element={<SedesPage />} />
          <Route path="/tipos-evento" element={<TiposEventoPage />} />
        </Route>

        {/* Administración de empresas: solo el super admin */}
        <Route element={<SoloSuperAdmin />}>
          <Route path="/empresas" element={<EmpresasPage />} />
          <Route path="/empresas/nueva" element={<EmpresaFormPage />} />
          <Route path="/empresas/:id/editar" element={<EmpresaFormPage />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
