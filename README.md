# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

Sistema de Gestión y Envío de SMS – Frontend
🧭 Descripción

Interfaz web para la administración y monitoreo del sistema de envío de SMS.
Permite gestionar instituciones, áreas, módulos, plantillas, departamentos, usuarios y visualizar logs de mensajes enviados.

Desarrollado en React + TypeScript, con integración a una API Laravel protegida por JWT.

⚙️ Características principales

🔐 Autenticación JWT (login/logout con refresco automático).

👥 Gestión de usuarios con roles y permisos.

🏢 Administración de entidades:

Instituciones

Áreas (Subdirecciones)

Gerencias

Sistemas

Módulos

Departamentos

Plantillas SMS

📤 Envío y monitoreo de mensajes SMS.

📊 Registro y filtrado de logs (por módulo, estatus, fecha, texto).

⚡ Interfaz limpia y responsive, basada en Bootstrap 5.

🚫 Manejo de errores de permisos (403 Forbidden) con mensajes amigables.

🧩 Arquitectura modular con servicios y formularios desacoplados.

🧠 Stack Tecnológico
Tecnología Uso principal
React 18 + Vite Framework frontend
TypeScript Tipado estático
Bootstrap 5 UI base
React Hook Form + Zod Formularios con validación
Axios Cliente HTTP
version de node v22.12.0
npm 10.9.0

Instalación y ejecución

git clone https://github.com/BryntM1995/dga-notifications.git

Instalar dependencias

npm install

Configurar variables de entorno
Crear .env en la raíz:

VITE_API_URL=http://64.227.54.25:8000
VITE_MOCK_AUTH=false

Ejecutar en desarrollo
npm run dev
