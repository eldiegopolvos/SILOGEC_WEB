import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Incidencias() {
  const module = getModuleByPath("/incidencias");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Incidencias;