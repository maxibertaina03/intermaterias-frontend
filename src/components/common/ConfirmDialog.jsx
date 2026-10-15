import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Confirmación antes de una acción que no se puede deshacer (eliminar, cancelar, rechazar…).
// Uso: <ConfirmDialog titulo="¿Eliminar?" descripcion="…" onConfirmar={…}><Button>Eliminar</Button></ConfirmDialog>
export default function ConfirmDialog({ titulo, descripcion, textoConfirmar = "Confirmar", onConfirmar, children }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          {descripcion && <AlertDialogDescription>{descripcion}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmar}>{textoConfirmar}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
