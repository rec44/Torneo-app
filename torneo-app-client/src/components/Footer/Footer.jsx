import { Link } from 'react-router-dom'

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
    <footer className="bg-[#111009] text-[#a09890] border-t-[3px] border-accent mt-auto">

      {/* Fila principal */}
      <div className="flex items-center justify-between gap-8 px-12 py-6 flex-wrap max-md:px-5 max-md:gap-5">

        {/* Marca */}
        <div className="flex flex-col gap-[6px]">
          <Link to="/torneos"
            className="inline-flex items-center gap-[7px] text-[15px] font-bold text-[#f5f0e8] no-underline tracking-tight [&_svg]:text-accent">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
              <path d="M5 2h10v7a5 5 0 0 1-10 0V2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              <path d="M2 5h3M18 5h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M10 14v3M7 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            RiseCup
          </Link>
          <p className="text-[12px] text-[#4a4640] max-w-[240px] leading-[1.5]">
            Torneos deportivos con brackets automáticos y sistema ELO.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-[6px] flex-wrap max-[480px]:hidden">
          {[
            { to: '/torneos',     label: 'Torneos' },
            { to: '/mis-torneos', label: 'Mis torneos' },
            { to: '/perfil',      label: 'Perfil' },
          ].map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-3 py-[5px] text-[13px] text-[#706a60] no-underline rounded-md transition-colors hover:text-[#f5f0e8] hover:bg-white/5">
              {label}
            </Link>
          ))}
        </div>

        {/* Social */}
        <div className="flex gap-2">
          {SOCIAL.map(s => (
            <a key={s.label} href={s.href}
              className="inline-flex items-center justify-center w-[34px] h-[34px] text-[#706a60] bg-white/[0.04] border border-[#1e1c14] rounded-lg no-underline transition-all hover:text-[#f5f0e8] hover:border-accent hover:bg-accent/10"
              target="_blank" rel="noreferrer" aria-label={s.label}>
              {s.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Barra inferior */}
      <div className="flex items-center justify-between px-12 py-3 border-t border-[#1a1810] text-[12px] text-[#302e26] max-md:px-5 max-md:flex-col max-md:gap-1 max-md:text-center">
        <span>© {new Date().getFullYear()} RiseCup</span>
        <span className="text-[#3d3a30]">contacto@risecup.gg</span>
      </div>

    </footer>
  )
}
