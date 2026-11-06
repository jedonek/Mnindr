import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-link active' : 'nav-link');

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <Logo to={user ? '/discover' : '/'} />

      {user ? (
        <div className="header-actions">
          <nav className="main-nav" aria-label="Hlavní navigace">
            <NavLink to="/discover" className={navClass}>
              Objevovat
            </NavLink>
            <NavLink to="/chat" className={navClass}>
              Chat
            </NavLink>
            <NavLink to="/profile/preferences" className={navClass}>
              Preference
            </NavLink>
          </nav>
          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className="link-button"
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="Můj účet"
              onClick={() => setOpen((v) => !v)}
            >
              <Avatar name={user.nickname || user.firstName} photo={user.photo} background={user.photoBg} />
            </button>
            {open && (
              <div className="user-menu__list" role="menu">
                <Link to="/profile/edit" role="menuitem" onClick={() => setOpen(false)}>
                  Upravit profil
                </Link>
                <Link to="/support" role="menuitem" onClick={() => setOpen(false)}>
                  Podpora
                </Link>
                <Link to="/rules" role="menuitem" onClick={() => setOpen(false)}>
                  Bezpečí a pravidla
                </Link>
                <button type="button" role="menuitem" onClick={handleLogout}>
                  Odhlásit se
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="header-actions">
          <Link to="/login" className="nav-link">
            <Icon name="user" size={20} filled />
            Přihlásit se
          </Link>
          <Button to="/register" variant="secondary" small>
            Zaregistrovat se
          </Button>
        </div>
      )}
    </header>
  );
}
