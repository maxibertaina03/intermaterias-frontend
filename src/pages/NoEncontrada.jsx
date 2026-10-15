import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NoEncontrada() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-primary text-7xl font-bold">404</p>
      <p className="text-muted-foreground">La página que buscás no existe.</p>
      <Button variant="outline" asChild><Link to="/">Volver al inicio</Link></Button>
    </div>
  );
}
