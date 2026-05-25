import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Recepcion() {
  const module = getModuleByPath("/recepcion");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Recepcion;