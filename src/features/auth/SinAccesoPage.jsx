import { SignOutButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { usaClerk } from "./clerk";

// La persona inició sesión, pero no está dada de alta en "usuarios" con ese email.
export default function SinAccesoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-xl font-semibold">No tenés acceso al sistema</p>
      <p className="text-muted-foreground max-w-md text-sm">
        Tu cuenta no está dada de alta en la organizadora. Pedile a un responsable que te registre
        con el mismo email con el que iniciaste sesión.
      </p>
      {usaClerk && <SignOutButton><Button variant="outline">Cerrar sesión</Button></SignOutButton>}
    </div>
  );
}
