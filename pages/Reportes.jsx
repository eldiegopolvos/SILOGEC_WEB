import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Reportes() {
  const module = getModuleByPath("/reportes");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Reportes;