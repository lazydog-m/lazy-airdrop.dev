import { Suspense, lazy } from 'react';
import { useRoutes } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import DashboardLayout from '../layouts';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  window.scrollTo(0, 0);
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: (
        <DashboardLayout />
      ),
      children: [
        {
          path: 'app',
          element: <GeneralApp />
        },

        {
          path: 'project',
          children: [
            { path: 'list', element: <ProjectList /> },
          ],
        },

        {
          path: 'profile',
          children: [
            { path: 'list', element: <ProfileList /> },
          ],
        },

        {
          path: 'web3-wallet',
          children: [
            { path: 'list', element: <Web3WalletList /> },
          ],
        },

        {
          path: 'extension',
          children: [
            { path: 'list', element: <ExtensionList /> },
          ],
        },

        // {
        //   path: 'task',
        //   children: [
        //     { path: 'list', element: <TaskList /> },
        //     { path: 'create', element: <TaskNewEdit /> },
        //     { path: ':id/edit', element: <TaskNewEdit /> },
        //   ],
        // },
        {
          path: 'script',
          children: [
            { path: 'list', element: <ScriptList /> },
            { path: 'create', element: <ScriptNewEdit /> },
            { path: ':id/edit', element: <ScriptNewEdit /> },
          ],
        },
        // { path: 'statistics', element: <ThongKe /> },
      ],
    },

    // { path: '/', element: <Navigate to="/dashboard/employee/list" replace /> },
    // { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

const ProjectList = Loadable(lazy(() => import('../pages/dashboard/project/list/ProjectList')));
const ProfileList = Loadable(lazy(() => import('../pages/dashboard/profile/list/ProfileList')));
const Web3WalletList = Loadable(lazy(() => import('../pages/dashboard/wallet/list/Web3WalletList')));
const ExtensionList = Loadable(lazy(() => import('../pages/dashboard/extension/list/ExtensionList')));
// const TaskList = Loadable(lazy(() => import('../pages/dashboard/task/list/TaskList')));
// const TaskNewEdit = Loadable(lazy(() => import('../pages/dashboard/task/new-edit/TaskNewEdit')));
const ScriptList = Loadable(lazy(() => import('../pages/dashboard/script/list/ScriptList')));
const ScriptNewEdit = Loadable(lazy(() => import('../pages/dashboard/script/new-edit/ScriptNewEdit')));
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/statistics/GeneralApp')));
