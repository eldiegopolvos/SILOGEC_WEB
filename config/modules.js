import {
  LayoutDashboard,
  PackageCheck,
  ShoppingCart,
  Truck,
  MapPinned,
  TriangleAlert,
  Radar,
  FileText,
  Settings,
} from "lucide-react";

export const modules = [
  {
    label: "Panel Ejecutivo",
    path: "/dashboard",
    icon: LayoutDashboard,
    eyebrow: "Panel Operativo",
    title: "Panel Ejecutivo",
    description:
      "Vista general de recepción, embarques, comercio electrónico, incidencias y cumplimiento operativo.",
  },
  {
    label: "Recepción",
    path: "/recepcion",
    icon: PackageCheck,
    eyebrow: "Módulo Operativo",
    title: "Recepción",
    description:
      "Control de paquetes recibidos, validación, entrega interna, incidencias y pendientes por usuario.",
  },
  {
    label: "Comercio Electrónico",
    path: "/ecommerce",
    icon: ShoppingCart,
    eyebrow: "Módulo Operativo",
    title: "Comercio Electrónico",
    description:
      "Control de pedidos E-COM, lotes, guías, plataformas, ventanas operativas y salida por paquetería.",
  },
  {
    label: "Embarques Foráneo",
    path: "/foraneo",
    icon: Truck,
    eyebrow: "Módulo Operativo",
    title: "Embarques Foráneo",
    description:
      "Consolidaciones, destinos asignados, manifiestos PDF, QR y cierre operativo de envíos foráneos.",
  },
  {
    label: "Embarques Local",
    path: "/local",
    icon: MapPinned,
    eyebrow: "Módulo Operativo",
    title: "Embarques Local",
    description:
      "Control de rutas locales, asignaciones, consolidación, salida y cumplimiento de entregas.",
  },
  {
    label: "Incidencias",
    path: "/incidencias",
    icon: TriangleAlert,
    eyebrow: "Control Operativo",
    title: "Incidencias",
    description:
      "Registro, seguimiento, evidencia, trazabilidad y cierre de incidencias operativas.",
  },
  {
    label: "Rastreo",
    path: "/tracking",
    icon: Radar,
    eyebrow: "Seguimiento Operativo",
    title: "Rastreo",
    description:
      "Consulta masiva de guías, actualización de estatus, alertas y seguimiento por paquetería.",
  },
  {
    label: "Reportes Ejecutivos",
    path: "/reportes",
    icon: FileText,
    eyebrow: "Inteligencia Operativa",
    title: "Reportes Ejecutivos",
    description:
      "Generación de indicadores, reportes PDF, exportables Excel, SLA, productividad y cumplimiento.",
  },
  {
    label: "Administración",
    path: "/administracion",
    icon: Settings,
    eyebrow: "Configuración",
    title: "Administración",
    description:
      "Gestión de usuarios, roles, permisos, catálogos, parámetros y configuración general del sistema.",
  },
];

export function getModuleByPath(pathname) {
  return modules.find((module) => module.path === pathname) || modules[0];
}