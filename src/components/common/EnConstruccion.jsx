import PageHeader from "@/components/common/PageHeader";
import { Vacio } from "@/components/common/Estados";

// Página provisoria: la reemplaza el responsable del área cuando la desarrolla.
export default function EnConstruccion({ titulo, responsable, issue }) {
  return (
    <>
      <PageHeader titulo={titulo} />
      <Vacio titulo="En construcción">
        Responsable: {responsable}{issue && ` · ${issue}`}
      </Vacio>
    </>
  );
}
