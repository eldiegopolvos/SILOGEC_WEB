import { LayoutDashboard, PackageCheck, ShoppingCart, Truck, MapPinned, AlertTriangle, Radar, FileText, Settings, ShieldCheck, Clock3 } from "lucide-react";

export const modules = [
  { id: "dashboard", label: "Panel Ejecutivo", icon: LayoutDashboard },
  { id: "recepcion", label: "Recepción", icon: PackageCheck },
  { id: "ecommerce", label: "Comercio Electrónico", icon: ShoppingCart },
  { id: "foraneo", label: "Embarques Foráneo", icon: Truck },
  { id: "local", label: "Embarques Local", icon: MapPinned },
  { id: "incidencias", label: "Incidencias", icon: AlertTriangle },
  { id: "tracking", label: "Rastreo", icon: Radar },
  { id: "reportes", label: "Reportes Ejecutivos", icon: FileText },
  { id: "admin", label: "Administración", icon: Settings },
];

export const kpis = [
  { title: "Cumplimiento Operativo", value: "98.4%", detail: "Meta mensual ≥ 98%", icon: ShieldCheck },
  { title: "Pedidos E-COM", value: "426", detail: "Periodo activo", icon: ShoppingCart },
  { title: "Pendientes Recepción", value: "18", detail: "Por entregar / revisar", icon: PackageCheck },
  { title: "Fuera de Ventana", value: "7", detail: "Requieren seguimiento", icon: Clock3 },
];

export const operations = [
  { folio: "ECOM-2026-00128", modulo: "Comercio Electrónico", responsable: "Sandra Barrera", estatus: "EN PROCESO", ventana: "Dentro de ventana", prioridad: "Media" },
  { folio: "REC-2026-00451", modulo: "Recepción", responsable: "Jessica Miranda", estatus: "PENDIENTE POR ENTREGAR", ventana: "Pendiente día anterior", prioridad: "Alta" },
  { folio: "FOR-2026-00089", modulo: "Foráneo", responsable: "Adrián Vega", estatus: "COMPLETADO", ventana: "Corte 14:00", prioridad: "Baja" },
  { folio: "INC-2026-00016", modulo: "Incidencias", responsable: "Diego Campos", estatus: "EN INVESTIGACIÓN", ventana: "SLA activo", prioridad: "Crítica" },
];

export const moduleCards = [
  { title: "Recepción", description: "Escaneo, entrega, incidencias y control de pendientes por usuario.", tags: ["Guías", "Paquetes", "Incidencias"] },
  { title: "Comercio Electrónico", description: "Pedidos por plataforma, guías, paquetería, SLA y fuera de horario.", tags: ["Amazon", "Magento", "Liverpool", "ML"] },
  { title: "Foráneo", description: "Consolidaciones, destinos asignados, manifiestos y cierre operativo.", tags: ["UPS", "PDF", "QR"] },
  { title: "Rastreo", description: "Consulta masiva, actualización de estatus y alertas por paquetería.", tags: ["Pakke", "Pak2Go", "UPS"] },
];

export const ecommercePedidos = [];

export const recepciones = [
  { guia: "1Z8756XW9081716253", origen: "UPS", paquetes: 4, usuario: "Jessica Miranda", estatus: "PENDIENTE POR ENTREGAR" },
  { guia: "7865123498765432109876", origen: "Estafeta", paquetes: 1, usuario: "Filiberto Cuevas", estatus: "ENTREGADO" },
  { guia: "DHL9876543210", origen: "DHL", paquetes: 2, usuario: "Axel Cuevas", estatus: "EN INCIDENCIA" },
];
