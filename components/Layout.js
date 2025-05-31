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
          background-color: white;
          color: #333;
          border-bottom: 1px solid #eee;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.8rem 1rem;
          flex-wrap: wrap;
        }

        .logo {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .nav-link {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          transition: background-color 0.3s;
        }

        .nav-link:hover {
          background-color: #f0f0f0;
        }

        .nav-link.active {
          background-color: #0070f3;
          color: white;
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
          background-color: #fafafa;
        }

        @media (max-width: 768px) {
          .nav-links {
            justify-content: center;
            gap: 0.5rem;
            padding-top: 0.5rem;
          }

          .nav-link {
            font-size: 0.9rem;
            padding: 0.3rem 0.6rem;
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
