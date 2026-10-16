import { useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { usaClerk } from "./clerk";

// La persona inició sesión, pero no está dada de alta en "usuarios" con ese email.
function Salir() {
  const { signOut } = useClerk();
  return <Button variant="outline" onClick={() => signOut()}>Cerrar sesión</Button>;
}

export default function SinAccesoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-xl font-semibold">No tenés acceso al sistema</p>
      <p className="text-muted-foreground max-w-md text-sm">
        Tu cuenta está desactivada en la organizadora. Pedile a un responsable que la habilite.
      </p>
      {usaClerk && <Salir />}
    </div>
  );
}
