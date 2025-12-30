# Documentación Técnica - Daymark

## 1. Visión General
Daymark es una aplicación web progresiva (PWA) diseñada para el seguimiento de objetivos y hábitos diarios. La arquitectura sigue un patrón basado en componentes controlados por una clase central (`App`) y utiliza Firebase para la persistencia de datos, con soporte robusto para modo offline.

## 2. Estructura del Proyecto

### Directorios
- `componentes/`: Contiene la lógica de la interfaz y servicios.
- `tests/`: Pruebas unitarias.
- `assets/`: Recursos estáticos (estilos, imágenes).

### Componentes Principales
| Archivo | Clase | Descripción |
|---------|-------|-------------|
| `app.js` | `App` | Controlador principal. Gestiona el estado global, enrutamiento simple y lógica de negocio. |
| `firebase.js` | `FirebaseService` | Capa de abstracción para autenticación y base de datos (Firestore). |
| `auth.js` | `AuthScreen` | Maneja Login y Registro con validaciones visuales. |
| `home.js` | `Home` | Vista principal que orquesta el calendario y acciones diarias. |
| `calendarView.js` | `CalendarView` | Renderiza la visualización de progreso (vistas Dual y Single). |
| `goalsList.js` | `GoalsList` | CRUD de objetivos. |
| `goalForm.js` | `GoalForm` | Formulario para crear/editar objetivos con validación. |
| `settings.js` | `Settings` | Configuración de usuario (tema, notificaciones). |
| `welcome.js` | `WelcomeScreen` | Onboarding inicial. |

## 3. Estándares de Desarrollo

### 3.1 Estilo de Código
- **JSDoc**: Todos los métodos y clases deben estar documentados con JSDoc.
- **Clases ES6**: Uso de clases modernas para encapsulamiento.
- **Eventos**: Se permite el uso de eventos inline para acciones globales (e.g., `onclick="app.method()"`). Para lógica interna del componente, usar `attachEvents()`.

### 3.2 Manejo de Fechas
Para evitar problemas de zona horaria, las fechas se manejan como strings en formato `YYYY-MM-DD` basadas en la hora local del usuario.
- **Método clave**: `app.getTodayString()` retorna la fecha local actual.
- **Almacenamiento**: Las fechas de inicio/fin y registros diarios se guardan como strings simples, evitando objetos `Date` UTC que puedan causar desfases de día.

### 3.3 Accesibilidad (A11y)
- **Botones**: Todo botón interactivo debe tener texto visible o `aria-label` descriptivo.
- **Formularios**: Inputs asociados explícitamente a labels.
- **Teclado**: Elementos interactivos personalizados (como selectores de color) deben ser accesibles vía teclado (`tabindex="0"`, manejo de `Enter`/`Space`).

### 3.4 Modo Offline
La aplicación detecta automáticamente la falta de conexión.
- `localStorage` actúa como espejo de los datos del usuario.
- Si Firebase falla o no hay red, la app degrada elegantemente a modo local.

## 4. Pruebas
Las pruebas unitarias están planificadas para futuras versiones.
- Se validarán funciones críticas como el cálculo de rachas y generación de calendarios.

## 5. Flujo de Datos
1. **Inicio**: `App` inicializa `FirebaseService`.
2. **Autenticación**: Si hay usuario, carga datos de Firebase; si no, revisa `localStorage`.
3. **Renderizado**: `App.render()` determina qué componente mostrar (`Home`, `GoalsList`, etc.).
4. **Interacción**: Los componentes notifican a `App` para cambios de estado (e.g., `app.addGoal()`).
5. **Persistencia**: `App` guarda en Firebase (si online) y siempre en `localStorage`.
