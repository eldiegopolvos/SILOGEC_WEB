import PageShell from "../components/PageShell";
import { getModuleByPath } from "../config/modules";

function Tracking() {
  const module = getModuleByPath("/tracking");

  return (
    <PageShell
      eyebrow={module.eyebrow}
      title={module.title}
      description={module.description}
    />
  );
}

export default Tracking;