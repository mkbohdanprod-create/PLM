import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import './index.css';

function Root() {
  const { session } = useAuth();
  if (!session) return <Login />;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </StrictMode>
);
