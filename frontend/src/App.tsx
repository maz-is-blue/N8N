import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { WorkflowList } from './pages/WorkflowList';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { WorkflowRuns } from './pages/WorkflowRuns';
import { RunDetails } from './pages/RunDetails';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/workflows"
        element={
          <PrivateRoute>
            <WorkflowList />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflows/:id"
        element={
          <PrivateRoute>
            <WorkflowBuilder />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflows/:id/runs"
        element={
          <PrivateRoute>
            <WorkflowRuns />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflows/:id/runs/:runId"
        element={
          <PrivateRoute>
            <RunDetails />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/workflows" />} />
    </Routes>
  );
}

export default App;
