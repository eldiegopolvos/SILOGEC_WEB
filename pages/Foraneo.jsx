import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Foraneo() {
  const module = getModuleByPath("/foraneo");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Foraneo;