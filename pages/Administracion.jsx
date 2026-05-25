import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Administracion() {
  const module = getModuleByPath("/administracion");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Administracion;