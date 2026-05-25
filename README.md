# SILOGEC Web

Aplicación web operativa para SILOGEC. Incluye panel ejecutivo, navegación por módulos y flujo E-COM para control de lotes, pedidos, guías, paqueterías, estatus y datos temporales en navegador.

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

## Build de producción

```bash
npm run build
```

El resultado se genera en `dist/`. Esa carpeta no se versiona en Git porque se puede reconstruir con el comando anterior.

## Vista previa del build

```bash
npm run preview
```

## Módulos actuales

- Panel Ejecutivo
- Recepción
- Comercio Electrónico
- Embarques Foráneo
- Embarques Local
- Incidencias
- Rastreo
- Reportes Ejecutivos
- Administración

## Flujo E-COM

- `Lotes` es la vista operativa principal.
- `Pedidos sin lote` funciona como bandeja para pedidos manuales o pendientes por vincular.
- Los datos temporales se guardan en `localStorage` del navegador.
- La opción `Limpiar temporal` reinicia lotes, pedidos temporales y consecutivo local.
