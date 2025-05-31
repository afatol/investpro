import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const router = useRouter()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Transações', href: '/transacoes' },
    { label: 'Rendimentos', href: '/rendimentos' }
  ]

  return (
    <div className="layout-wrapper">
      <nav className="top-nav">
        <div className="nav-container">
          <span className="logo">InvestPro</span>
          <div className="nav-links">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${router.pathname === item.href ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="page-content" key="layout-main">
        {children}
      </main>

      <footer className="site-footer">
        © InvestPro 2025 — Todos os direitos reservados
      </footer>

      <style jsx>{`
        .layout-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .top-nav {
          background-color: #0070f3;
          color: white;
          padding: 0.8rem 0;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1024px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 0 1rem;
        }

        .logo {
          font-size: 1.4rem;
          font-weight: bold;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          white-space: nowrap;
          padding-bottom: 0.3rem;
          scrollbar-width: none; /* Firefox */
        }

        .nav-links::-webkit-scrollbar {
          display: none; /* Chrome */
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          transition: background-color 0.3s;
          flex: 0 0 auto;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        .nav-link.active {
          background-color: white;
          color: #0070f3;
          font-weight: bold;
        }

        .page-content {
          flex-grow: 1;
          padding: 2rem 1rem;
        }

        .site-footer {
          text-align: center;
          font-size: 0.9rem;
          padding: 1rem;
          border-top: 1px solid #eee;
          background-color: #fafafa;
        }

        @media (max-width: 640px) {
          .nav-container {
            gap: 0.2rem;
          }

          .nav-link {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  )
}
