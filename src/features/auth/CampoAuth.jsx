import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Campo del login: label, input (con "mostrar contraseña" si es password) y error.
export default function CampoAuth({ id, label, type = "text", error, extra, ...props }) {
  const [ver, setVer] = useState(false);
  const esPassword = type === "password";
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {extra}
      </div>
      <div className="relative">
        <Input id={id} type={esPassword && ver ? "text" : type} aria-invalid={Boolean(error)}
          className={esPassword ? "pr-10" : undefined} {...props} />
        {esPassword && (
          <button type="button" onClick={() => setVer((v) => !v)} tabIndex={-1}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
