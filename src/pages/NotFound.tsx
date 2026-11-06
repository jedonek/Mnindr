import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export function NotFound() {
  return (
    <div className="page">
      <div className="site-header">
        <Logo />
      </div>
      <main className="prose center" style={{ alignItems: 'center', paddingTop: 64 }}>
        <h1>404</h1>
        <p>Tahle stránka se někam zatoulala. Kočky už jsou takové.</p>
        <Button to="/">Zpět domů</Button>
      </main>
    </div>
  );
}
