import { Navigate, Outlet, useLocation, useMatches } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Mascot, Sparkle } from '@/components/ui/Mascot';
import { Logo } from '@/components/ui/Logo';
import { Footer } from './Footer';
import { Header } from './Header';

/** Kořen aplikace – poskytuje auth kontext všem routám. */
export function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

/** Veřejné stránky (landing, podpora, pravidla…) s hlavičkou a patičkou. */
export function PublicLayout() {
  return (
    <div className="page">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

interface RouteHandle {
  mascot?: 'girl' | 'boy';
}

/** Auth stránky: karta formuláře vlevo, maskot vpravo. Přihlášené přesměruje do aplikace. */
export function AuthLayout() {
  const { user, loading } = useAuth();
  const matches = useMatches();
  const location = useLocation();
  const handle = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.mascot)?.handle as
    | RouteHandle
    | undefined;

  if (loading) return null;
  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/discover'} replace />;
  }

  return (
    <div className="page">
      <div className="site-header">
        <Logo />
      </div>
      <main className="auth">
        <div className="auth__card">
          <Outlet />
        </div>
        <div className="auth__art">
          <Mascot variant={handle?.mascot ?? 'girl'} />
          <Sparkle className="sparkle" />
        </div>
      </main>
    </div>
  );
}

/** Chráněné stránky – nepřihlášené pošle na /login. */
export function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="page">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
