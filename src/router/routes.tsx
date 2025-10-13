import { Navigate, createBrowserRouter } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import ProtectedLayout from '../components/layout/ProtectedLayout';

// páginas
import Login from '../pages/Login';
import Home from '../pages/Home';
import Institutions from '../pages/Maintenance/Institutions';
import Areas from '../pages/Maintenance/Areas';
import Gerencies from '../pages/Maintenance/Gerencies';
import Departments from '../pages/Maintenance/Departments';
import Systems from '../pages/Maintenance/Systems';
import Modules from '../pages/Maintenance/Modules';
import Creation from '../pages/Templates/Creation';
import Test from '../pages/Templates/Test';
import Users from '../pages/Settings/Users';
import Monitoring from '../pages/Settings/Monitoring';

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },

  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <Home /> },

          // Mantenimientos
          { path: 'maintenance/institutions', element: <Institutions /> },
          { path: 'maintenance/areas', element: <Areas /> },
          { path: 'maintenance/gerencies', element: <Gerencies /> },
          { path: 'maintenance/departments', element: <Departments /> },
          { path: 'maintenance/systems', element: <Systems /> },
          { path: 'maintenance/modules', element: <Modules /> },

          // Plantillas
          { path: 'templates/creation', element: <Creation /> },
          { path: 'templates/test', element: <Test /> },

          // Configuraciones
          { path: 'settings/users', element: <Users /> },
          { path: 'settings/monitoring', element: <Monitoring /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);
