import {
  dashboardKpis,
  operations,
  quickActions,
  systemStatus,
  baseModules,
} from "../data/dashboardData";

import KpiCard from "../components/KpiCard";
import OperationsTable from "../components/OperationsTable";
import QuickActions from "../components/QuickActions";
import SystemStatus from "../components/SystemStatus";
import ModuleCard from "../components/ModuleCard";

function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardKpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <OperationsTable rows={operations} />

        <div className="space-y-6">
          <QuickActions actions={quickActions} />
          <SystemStatus status={systemStatus} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#061a2f]">
            Módulos base
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Estos bloques serán las primeras pantallas operativas de la plataforma.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {baseModules.map((module, index) => (
            <ModuleCard
              key={module.title}
              title={module.title}
              description={module.description}
              tags={module.tags}
              path={module.path}
              index={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;