import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Local() {
  const module = getModuleByPath("/local");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Local;