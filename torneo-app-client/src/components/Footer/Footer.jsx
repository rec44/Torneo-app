import { Link } from 'react-router-dom'
import './Footer.css'

const SOCIAL = [
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/risecup',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/risecup_app',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:contacto@risecup.gg',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M2 7l10 7 10-7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="pie">
      <div className="pie-interior">

        <div className="pie-columna-marca">
          <Link to="/torneos" className="pie-marca">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
              <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M2 5h3M18 5h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            RiseCup
          </Link>
          <p className="pie-eslogan">Torneos deportivos con brackets automáticos y sistema ELO.</p>
        </div>

        <div className="pie-fila-enlaces">
          <Link to="/torneos"     className="pie-enlace">Torneos</Link>
          <Link to="/mis-torneos" className="pie-enlace">Mis torneos</Link>
          <Link to="/perfil"      className="pie-enlace">Perfil</Link>
        </div>

        <div className="pie-social">
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href} className="pie-btn-social"
              target="_blank" rel="noreferrer" aria-label={s.label}>
              {s.icon}
            </a>
          ))}
        </div>

      </div>

      <div className="pie-inferior">
        <span>© {new Date().getFullYear()} RiseCup</span>
        <span className="pie-email">contacto@risecup.gg</span>
      </div>
    </footer>
  )
}
