import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Layout({ children }) {
  const router = useRouter()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Transações', href: '/transacoes' },
    { label: 'Rendimentos', href: '/rendimentos' },
    { label: 'Depósitos', href: '/deposit' },
    { label: 'Saques', href: '/withdraw' },
    { label: 'Minha Rede', href: '/rede' },
    { label: 'Planos', href: '/planos' },
    { label: 'Manual', href: '/manual' },
    { label: 'Sobre', href: '/sobre' },
    { label: 'Sair', href: '/logout' }
  ]

  return (
    <div className="layout-wrapper">
      <nav className="top-nav">
        <div className="nav-container">
          <Link href="/">
            <div className="logo">
              <Image
                src="/logo.png"
                alt="InvestPro"
                width={130}
                height={38}
                priority
              />
            </div>
          </Link>

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

      <main className="page-content">{children}</main>

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
          background-color: #0a0a23;
          color: white;
          padding: 0.8rem 1.2rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .logo {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .nav-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: flex-end;
          flex: 1;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          transition: background-color 0.3s;
        }

        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .nav-link.active {
          background-color: white;
          color: #0a0a23;
          font-weight: bold;
        }

        .page-content {
          flex-grow: 1;
          padding: 2rem 1rem;
          max-width: 1200px;
          margin: auto;
          width: 100%;
        }

        .site-footer {
          text-align: center;
          font-size: 0.9rem;
          padding: 1rem;
          border-top: 1px solid #eee;
          background-color: #f5f5f5;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column;
            align-items: flex-start;
          }

          .nav-links {
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
            padding-top: 0.5rem;
          }

          .nav-link {
            padding: 0.6rem 0.4rem;
            width: 100%;
          }

          .logo img {
            width: 110px;
            height: auto;
          }
        }
      `}</style>
    </div>
  )
}
