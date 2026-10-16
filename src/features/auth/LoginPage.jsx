import { SignIn } from "@clerk/react";

// Pantalla de inicio de sesión (componente de Clerk, en español).
export default function LoginPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <p className="text-xl font-semibold">Eventos estudiantiles</p>
        <p className="text-muted-foreground text-sm">Sistema de gestión para el personal de la organizadora</p>
      </div>
      <SignIn routing="hash" />
    </div>
  );
}
