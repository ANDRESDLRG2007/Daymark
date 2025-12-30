# Daymark

## 1. Descripción
**Daymark** es una aplicación web progresiva (PWA) moderna diseñada para la planificación y seguimiento detallado de objetivos personales y hábitos diarios.

**¿Para quién es?**
Ideal para personas que buscan mejorar su productividad, mantener la constancia en nuevos hábitos o simplemente organizar sus metas a largo plazo de manera visual y estructurada.

**¿Qué problema resuelve?**
Daymark elimina la fricción de usar múltiples herramientas o agendas físicas, ofreciendo una solución centralizada que:
- Visualiza el progreso con calendarios interactivos y estadísticas claras.
- Funciona sin conexión (Offline-first), asegurando que tus datos estén siempre accesibles.
- Sincroniza tus metas en la nube cuando tienes conexión.

**Enlaces de Acceso Rápido:**
- **Versión Web (Demo)**: [https://andresdlrg2007.github.io/Daymark/](https://andresdlrg2007.github.io/Daymark/)
- **Versión Móvil (APK)**: [Descargar desde Google Drive](https://drive.google.com/file/d/1M7zB6lPSBZEqGuiuRtV-IPWWvoDdS3PX/view?usp=sharing)

## 2. Instalación Rápida

### Requisitos Previos
- Un navegador web moderno (Chrome, Edge, Firefox).
- Python 3 (opcional, para servidor local) o cualquier extensión de "Live Server".

### Ejecución en 5 minutos
1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/ANDRESDLRG2007/daymark.git
   cd daymark
   ```

2. **Iniciar servidor local** (Recomendado para evitar bloqueos de CORS):
   ```bash
   # Opción con Python 3
   python -m http.server 8000
   ```
   *O usa la extensión "Live Server" en VS Code.*

3. **Abrir en el navegador**:
   Visita `http://localhost:8000` en tu navegador favorito.

¡Listo! La aplicación cargará inmediatamente.

## 3. Estado del Proyecto
**Estado Actual**: 🟢 **Estable / En Mantenimiento Activo**
- **Versión**: 1.0.0
- **Última Actualización**: Diciembre 2025

El proyecto cuenta con funcionalidades completas de CRUD, autenticación y sincronización. Se están realizando mejoras continuas en accesibilidad y rendimiento.

**Roadmap Futuro**:
- [ ] Notificaciones push para recordatorios diarios.
- [ ] Exportación de datos a PDF/CSV.
- [ ] Gamificación avanzada (medallas y logros).

## 4. Documentación Adicional

Para detalles técnicos profundos sobre la arquitectura y el código:
👉 **[Ver Documentación Técnica Completa](DOCUMENTATION.md)**

### Preguntas Frecuentes (FAQ)
**P: ¿Necesito internet para usarla?**
R: No. Daymark funciona 100% offline y sincroniza tus datos cuando recuperas la conexión.

**P: ¿Es seguro?**
R: Sí. Utilizamos Firebase Authentication para gestionar tu cuenta y proteger tus datos.

### Cómo Contribuir
¡Las contribuciones son bienvenidas!
1. Haz un Fork del repositorio.
2. Crea una rama para tu mejora (`git checkout -b feature/NuevaMejora`).
3. Envía un Pull Request describiendo tus cambios.

---
*Desarrollado por ANDRESDLRG2007*
