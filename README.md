# Daymark

Una aplicación web moderna para la planificación y seguimiento de objetivos personales. Permite crear metas con fechas específicas, marcar el progreso diario en un calendario interactivo y visualizar estadísticas de cumplimiento.

## ✨ Características

### 🎯 Gestión de Objetivos
- **Crear objetivos**: Define metas con título, descripción, fechas de inicio y fin, y color personalizado
- **Seguimiento diario**: Marca cada día como completado, pendiente, omitido o fallido
- **Vista de calendario**: Calendario mensual interactivo para visualizar el progreso
- **Lista de objetivos**: Gestiona múltiples objetivos activos

### 📊 Estadísticas y Análisis
- **Progreso visual**: Barras de progreso para cada objetivo
- **Estadísticas generales**: Métricas de cumplimiento, días completados, etc.
- **Vista dual**: Alterna entre calendario y lista de objetivos

### 🎨 Personalización
- **Modo oscuro**: Tema claro y oscuro para comodidad visual
- **Estilos heavy**: Tema avanzado con animaciones elaboradas y paleta de colores armónica (solo modo claro)
- **Colores personalizados**: Asigna colores únicos a cada objetivo

### 🔐 Autenticación y Sincronización
- **Cuenta de usuario**: Registro e inicio de sesión con Firebase
- **Sincronización en la nube**: Datos guardados automáticamente en Firebase
- **Modo offline**: Funciona sin conexión, sincroniza cuando hay internet

### 📱 Interfaz Intuitiva
- **Navegación por footer**: Acceso rápido a añadir objetivos, inicio, lista y configuración
- **Animaciones suaves**: Transiciones y efectos visuales modernos
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Firebase (Authentication, Firestore)
- **Estilos**: CSS Variables, Flexbox, Grid, Animaciones CSS
- **Arquitectura**: Componentes modulares en JavaScript

## 🚀 Instalación y Uso

### Prerrequisitos
- Navegador web moderno
- Conexión a internet (para sincronización, opcional para modo offline)

### Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/ANDRESDLRG2007/daymark.git
   cd daymark
   ```

2. Abre el archivo `index.html` en tu navegador o inicia un servidor local:
   ```bash
   python3 -m http.server 8000
   ```
   Luego visita `http://localhost:8000`

### Configuración Inicial
1. **Primera vez**: Verás la pantalla de bienvenida
2. **Registro/Inicio**: Crea una cuenta o inicia sesión para sincronizar datos
3. **Modo offline**: Si prefieres usar sin cuenta, selecciona "Modo offline"

## 📖 Guía de Uso

### Crear un Objetivo
1. Ve a "Añadir" en el footer
2. Completa el formulario:
   - Título del objetivo
   - Descripción detallada
   - Fecha de inicio y fin
   - Color personalizado
3. Guarda el objetivo

### Marcar Progreso Diario
1. En la vista de calendario, haz clic en un día
2. Selecciona el estado: Completado, Omitido, Fallido
3. Opcionalmente, añade una descripción diaria

### Gestionar Objetivos
- **Editar**: Desde la lista de objetivos, edita detalles
- **Eliminar**: Remueve objetivos completados o innecesarios
- **Ver progreso**: Revisa la barra de progreso y estadísticas

### Personalización
- **Modo oscuro**: En Configuración, activa/desactiva el tema oscuro
- **Estilos heavy**: Activa para un tema más animado con paleta armónica (solo claro)

## ⚙️ Configuración

### Opciones Disponibles
- **Descripción diaria**: Pedir descripción al marcar días como completados
- **Modo oscuro**: Cambiar entre tema claro y oscuro
- **Estilos heavy**: Activar tema avanzado con más animaciones
- **Cuenta**: Gestionar autenticación y datos

### Modo Offline
Si eliges no crear cuenta:
- Los datos se guardan localmente en tu navegador
- No hay sincronización entre dispositivos
- Puedes cambiar a cuenta después desde Configuración

## 📁 Estructura del Proyecto

```
daymark/
├── index.html              # Archivo principal HTML
├── style.css               # Estilos principales
├── heavy-style.css         # Estilos avanzados (opcional)
├── componentes/
│   ├── app.js              # Lógica principal de la aplicación
│   ├── auth.js             # Componente de autenticación
│   ├── calendarView.js     # Vista del calendario
│   ├── firebase.js         # Configuración de Firebase
│   ├── goalForm.js         # Formulario de objetivos
│   ├── goalsList.js        # Lista de objetivos
│   ├── home.js             # Pantalla principal
│   ├── settings.js         # Configuración
│   └── welcome.js          # Pantalla de bienvenida
└── README.md               # Este archivo
```

## 🔧 Desarrollo

### Arquitectura
- **Componentes modulares**: Cada pantalla es un componente independiente
- **Estado centralizado**: La clase `App` maneja el estado global
- **Firebase integration**: Servicios de autenticación y base de datos
- **CSS Variables**: Temas dinámicos con variables CSS

### Scripts Disponibles
- **Servidor local**: `python3 -m http.server 8000`
- **Desarrollo**: Abre `index.html` directamente en el navegador

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de uso personal. Todos los derechos reservados.

## 📞 Contacto

Proyecto desarrollado por ANDRESDLRG2007 - Daymark

---

*Última actualización: Diciembre 2025*
