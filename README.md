# DronSalud — Logística Médica Inteligente

Plataforma web de simulacion para la gestion de entregas de medicamentos mediante drones. Permite a farmacias preparar pedidos, a operadores asignar drones y realizar entregas, y a administradores supervisar todo el flujo.

## Tecnologías

- **React 19** — interfaz de usuario
- **Vite 8** — build tool
- **Tailwind CSS** (via CDN) — estilos
- **Leaflet + react-leaflet** — mapas interactivos
- **Lucide React** — iconos
- **Google Fonts** (Inter, Plus Jakarta Sans) — tipografia

> No hay backend real. Todos los datos (usuarios, pedidos, inventario, flota) son simulados en `src/data/adminData.js`.

## Roles y acceso

| Correo                  | Contrasena      | Rol        | Nombre        |
|-------------------------|-----------------|------------|---------------|
| admin@dronesalud.com    | Admin1234!      | admin      | Maria Torres  |
| cliente@dronesalud.com  | Cliente1234!    | cliente    | Juan Perez    |
| farmacia@dronesalud.com | Farmacia1234!   | farmacia   | Laura Mendez  |
| operador@dronesalud.com | Dron1234!       | operador   | Carlos Gomez  |

## Modulos por rol

### Admin
- Dashboard con KPIs y graficos
- Pedidos (tabla global + detalle)
- Estado de flota de drones
- Despacho de drones
- Gestion de usuarios (registrar operadores y farmacias con mapa)

### Farmacia
- Dashboard propio con metricas y foto del perfil
- Inventario (busqueda, tabla, agregar productos con foto)
- Ordenes recibidas (marcar como Preparado)
- Historial de pedidos

### Operador
- Despacho de drones (aceptar pedidos, seleccionar dron, lanzar)
- Historial de entregas
- Estado de flota

### Cliente
- Nueva compra (seleccionar farmacia, catalogo, carrito, mapa de entrega)
- Historial de compras
- Seguimiento de envios

## Estructura del proyecto

```
src/
├── assets/              # Imagenes (logo, hero)
├── components/
│   ├── admin/           # Modulos del panel administrativo
│   ├── charts/          # Graficos SVG personalizados
│   ├── client/          # Portal del cliente
│   ├── operator/        # Panel del operador de drones
│   └── ui/              # Componentes reutilizables (Badge, SidebarItem, etc.)
├── data/
│   └── adminData.js     # Datos simulados (usuarios, pedidos, inventario, flota)
├── App.jsx              # Componente raiz con maquina de estados
├── LoginFormView.jsx    # Pantalla de inicio de sesion
├── RegisterFormView.jsx # Registro de cuenta
└── main.jsx             # Punto de entrada
```

## Comandos

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Compilar para produccion
npm run preview  # Previsualizar build de produccion
npm run lint     # Ejecutar ESLint
```
