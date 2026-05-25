import {
  ShieldCheck,
  ShoppingCart,
  Package,
  Clock,
  FileText,
  QrCode,
  Radar,
  Download,
  ChevronRight,
} from "lucide-react";

export const dashboardKpis = [
  {
    title: "Cumplimiento Operativo",
    value: "98.4%",
    subtitle: "Meta mensual ≥ 98%",
    icon: ShieldCheck,
  },
  {
    title: "Pedidos E-COM",
    value: "426",
    subtitle: "Periodo activo",
    icon: ShoppingCart,
  },
  {
    title: "Pendientes Recepción",
    value: "18",
    subtitle: "Por entregar / revisar",
    icon: Package,
  },
  {
    title: "Fuera de Ventana",
    value: "7",
    subtitle: "Requieren seguimiento",
    icon: Clock,
  },
];

export const operations = [
  {
    folio: "ECOM-2026-00128",
    modulo: "Comercio Electrónico",
    responsable: "Sandra Barrera",
    estatus: "EN PROCESO",
    ventana: "Dentro de ventana",
    prioridad: "Media",
  },
  {
    folio: "REC-2026-00451",
    modulo: "Recepción",
    responsable: "Jessica Miranda",
    estatus: "PENDIENTE POR ENTREGAR",
    ventana: "Pendiente día anterior",
    prioridad: "Alta",
  },
  {
    folio: "FOR-2026-00089",
    modulo: "Foráneo",
    responsable: "Adrián Vega",
    estatus: "COMPLETADO",
    ventana: "Corte 14:00",
    prioridad: "Baja",
  },
  {
    folio: "INC-2026-00016",
    modulo: "Incidencias",
    responsable: "Diego Campos",
    estatus: "EN INVESTIGACIÓN",
    ventana: "SLA activo",
    prioridad: "Crítica",
  },
];

export const quickActions = [
  {
    label: "Generar PDF ejecutivo",
    icon: FileText,
    endIcon: Download,
  },
  {
    label: "Crear QR de evidencia",
    icon: QrCode,
    endIcon: ChevronRight,
  },
  {
    label: "Ejecutar rastreo masivo",
    icon: Radar,
    endIcon: ChevronRight,
  },
];

export const systemStatus = {
  title: "SILOGEC Web v1.0",
  description:
    "Estructura modular lista para conectar SQL, Access, reportes, QR y automatizaciones.",
  environment: "Prototipo",
  activeRole: "Supervisor",
};

export const baseModules = [
  {
    title: "Recepción",
    description: "Escaneo, entrega, incidencias y control de pendientes por usuario.",
    tags: ["Guías", "Paquetes", "Incidencias"],
    path: "/recepcion",
  },
  {
    title: "Comercio Electrónico",
    description: "Pedidos por plataforma, guías, paquetería, SLA y fuera de horario.",
    tags: ["Amazon", "Magento", "Liverpool", "ML"],
    path: "/ecommerce",
  },
  {
    title: "Foráneo",
    description: "Consolidaciones, destinos asignados, manifiestos y cierre operativo.",
    tags: ["UPS", "PDF", "QR"],
    path: "/foraneo",
  },
  {
    title: "Rastreo",
    description: "Consulta masiva, actualización de estatus y alertas por paquetería.",
    tags: ["Pakke", "Pak2Go", "UPS"],
    path: "/tracking",
  },
];