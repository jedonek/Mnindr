import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface CommonProps {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
  children: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined };
type RouterLinkProps = CommonProps & { to: string; className?: string; onClick?: () => void; href?: undefined };
type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };

function classes({ variant = 'primary', small, block }: CommonProps, extra?: string) {
  return [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    small && 'btn--small',
    block && 'btn--block',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Pilulkové tlačítko. Podle props vykreslí <button>, router <Link> nebo <a href>. */
export function Button(props: ButtonProps | RouterLinkProps | AnchorProps) {
  if (props.to !== undefined) {
    const { variant, small, block, children, className, to, onClick } = props;
    return (
      <Link to={to} className={classes({ variant, small, block, children }, className)} onClick={onClick}>
        {children}
      </Link>
    );
  }
  if (props.href !== undefined) {
    const { variant, small, block, children, className, ...rest } = props;
    return (
      <a {...rest} className={classes({ variant, small, block, children }, className)}>
        {children}
      </a>
    );
  }
  const { variant, small, block, children, className, type = 'button', ...rest } = props;
  return (
    <button {...rest} type={type} className={classes({ variant, small, block, children }, className)}>
      {children}
    </button>
  );
}
