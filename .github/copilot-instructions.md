<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
      **Summary:** Creating "Control de Alquiler de Jabas y Parihuelas" with Laravel API backend and Ionic (Angular) frontend for web/mobile

- [x] Scaffold the Project
      **Summary:** Created Laravel 10 backend and Ionic 7 (Angular) frontend with Capacitor

- [x] Customize the Project
      **Summary:**

  - Created database migrations for: clientes, choferes, placas, descripciones_jabas, registros, users (microsoft_id, avatar)
  - Created models with relationships: Cliente, Chofer, Placa, DescripcionJaba, Registro, User
  - Implemented API controllers with CRUD operations
  - Configured API routes with versioning (v1)
  - Configured CORS for frontend communication
  - Updated .env with database configuration
  - Created API service in Ionic with all endpoints
  - Created Home page with navigation cards
  - Created Registro Form page with camera integration
  - Configured HttpClient provider
  - Set up routing
  - Created seeders with realistic data (38 total records)
  - Implemented PDF generation with DomPDF
  - Implemented Excel export with Laravel Excel
  - Created complete CRUD interfaces:
    - Clientes (lista + form) ✅
    - Choferes (lista + form) ✅
    - Placas (lista + form) ✅
    - Descripciones (lista + form) ✅
  - Created Configuración page for master data management
  - Implemented Dashboard with Chart.js:
    - DashboardController with statistics endpoints
    - 4 charts: estado, mes, top clientes, top choferes
    - Totals cards and recent registros
  - Implemented Microsoft OAuth authentication:
    - Laravel Socialite installed
    - AuthController (login, register, logout, refresh, Microsoft OAuth)
    - AuthService, AuthGuard, AuthInterceptor in frontend
    - LoginPage with Microsoft button
    - Complete documentation in MICROSOFT_OAUTH_SETUP.md
  - Updated all routes in app.routes.ts

- [x] Install Required Extensions
      **Summary:** No additional extensions required. Chart.js installed for dashboard.

- [x] Compile the Project
      **Summary:** Backend and Frontend structure ready. MySQL migrations executed. All CRUD pages created. Dashboard and Auth implemented. No compilation errors.

- [ ] Create and Run Task
      **Summary:** Need to update Node.js version from v20.9.0 to v20.19+ to run Ionic

- [ ] Launch the Project
      **Summary:** Backend running on http://127.0.0.1:8000. Frontend pending Node.js update.

- [ ] Ensure Documentation is Complete
      **Summary:** DOCUMENTATION.md complete with installation, features, API endpoints. MICROSOFT_OAUTH_SETUP.md with Azure AD configuration steps.
