import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { usaClerk } from "./clerk";

// La persona inició sesión en Clerk, pero no tiene usuario en el sistema (o su empresa está desactivada).
function Salir() {
  const { signOut } = useClerk();
  return <Button variant="outline" onClick={() => signOut()}>Cerrar sesión</Button>;
}

export default function SinAccesoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-xl font-semibold">No tenés acceso al sistema</p>
      <p className="text-muted-foreground max-w-md text-sm">
        Tu usuario no está dado de alta o fue desactivado. Pedile el alta al administrador de tu empresa.
      </p>
      {usaClerk && <Salir />}
    </div>
  );
}
