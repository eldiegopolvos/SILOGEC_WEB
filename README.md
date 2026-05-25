# SILOGEC Web

SILOGEC Web es una aplicación operativa enfocada en automatizar y ordenar procesos de recepción, embarques, consolidado y comercio electrónico. El objetivo principal es facilitar que el equipo capture, procese, consulte y cierre actividades con mayor control, trazabilidad y velocidad.

Este proyecto nace desde la operación diaria de Recepción y Embarques, con enfoque en reducir trabajo manual, centralizar información, medir KPIs/SLA de forma automática y dar visibilidad al avance de cada proceso hasta la trazabilidad del envío por paquetería.

## Contexto Operativo

El sistema está orientado a apoyar las actividades del área coordinada por el Coordinador de Recepción y Embarques. Busca que el equipo tenga una herramienta más clara para:

- Registrar entradas y recepciones.
- Controlar pedidos y lotes de E-COM.
- Procesar guías, paqueterías y canales de entrega.
- Dar seguimiento a embarques locales y foráneos.
- Lograr trazabilidad de envíos por paquetería.
- Consolidar información operativa.
- Consultar estatus e incidencias.
- Medir KPIs y SLA operativos de forma automática.
- Preparar reportes ejecutivos y operativos.

## Objetivo

Construir una plataforma web modular que permita automatizar diferentes procesos logísticos y hacer más factible el trabajo diario del equipo, desde el ingreso de información hasta el cierre del proceso de embarques, consolidado, recepción y seguimiento por paqueterías.

La plataforma busca evolucionar hacia una herramienta de control operativo capaz de conectar captura, procesamiento, trazabilidad, KPIs y SLA en un solo flujo.

## Módulos Actuales

- Panel Ejecutivo
- Recepción
- Comercio Electrónico
- Embarques Foráneo
- Embarques Local
- Incidencias
- Rastreo y trazabilidad
- Reportes Ejecutivos
- Administración

## Flujo E-COM

- `Lotes` es la vista operativa principal.
- `Pedidos sin lote` funciona como bandeja para pedidos manuales o pendientes por vincular.
- Los datos temporales se guardan en `localStorage` del navegador.
- La opción `Limpiar temporal` reinicia lotes, pedidos temporales y consecutivo local.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Después abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Build de Producción

```bash
npm run build
```

El resultado se genera en `dist/`. Esa carpeta no se versiona en Git porque se puede reconstruir con el comando anterior.

## Vista Previa Del Build

```bash
npm run preview
```

## Estado Del Proyecto

Proyecto en evolución. Actualmente funciona como base web para integrar y automatizar procesos operativos del área de Recepción y Embarques, con crecimiento planeado hacia reportes, trazabilidad por paquetería, medición automática de KPIs/SLA, consolidaciones, control de usuarios y conexión con fuentes de datos internas.
