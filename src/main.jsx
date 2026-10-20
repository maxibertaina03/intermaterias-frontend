import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useMatch } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";
import { esES } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";
import AuthGate from "@/features/auth/AuthGate";
import InvitacionPage from "@/features/invitados/InvitacionPage";
import { CLERK_KEY, usaClerk } from "@/features/auth/clerk";
import "./index.css";
import App from "./App.jsx";

function Entrada() {
  const invitacionPublica = useMatch({ path: "/invitacion/:token", end: true });
  if (invitacionPublica) {
    return <Routes><Route path="/invitacion/:token" element={<InvitacionPage />} /></Routes>;
  }
  return <AuthGate><App /></AuthGate>;
}

const app = (
  <BrowserRouter>
    <Entrada />
    {/* Avisos (toast) para todo el sistema: import { toast } from "sonner" */}
    <Toaster richColors position="top-right" />
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {usaClerk ? (
      <ClerkProvider publishableKey={CLERK_KEY} localization={esES}>{app}</ClerkProvider>
    ) : app}
  </StrictMode>,
);
