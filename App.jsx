import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import SilogecAssistant from "./components/SilogecAssistant";

import Dashboard from "./pages/Dashboard";
import Recepcion from "./pages/Recepcion";
import Ecommerce from "./pages/Ecommerce";
import Foraneo from "./pages/Foraneo";
import Local from "./pages/Local";
import Incidencias from "./pages/Incidencias";
import Tracking from "./pages/Tracking";
import Reportes from "./pages/Reportes";
import Administracion from "./pages/Administracion";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <Sidebar />

        <main className="min-h-screen pl-20">
          <Header />

          <section className="p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recepcion" element={<Recepcion />} />
              <Route path="/ecommerce" element={<Ecommerce />} />
              <Route path="/foraneo" element={<Foraneo />} />
              <Route path="/local" element={<Local />} />
              <Route path="/incidencias" element={<Incidencias />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/administracion" element={<Administracion />} />

              <Route
                path="*"
                element={
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                      SILOGEC Web
                    </p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">
                      Página no encontrada
                    </h1>
                    <p className="mt-2 text-slate-500">
                      La ruta solicitada no existe dentro del sistema.
                    </p>
                  </div>
                }
              />
            </Routes>
          </section>
        </main>

        <SilogecAssistant />
      </div>
    </BrowserRouter>
  );
}

export default App;
