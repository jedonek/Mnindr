import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="site-footer">
      <nav aria-label="Patička">
        <Link to="/how-it-works">Jak to funguje</Link>
        <Link to="/support">Podpora</Link>
        <Link to="/rules">Bezpečí a pravidla</Link>
        <Link to="/terms">Obchodní podmínky</Link>
        <Link to="/privacy">Ochrana soukromí</Link>
      </nav>
      <p>© {new Date().getFullYear()} MŇINDR. Láska začíná jedním mňau.</p>
    </footer>
  );
}
