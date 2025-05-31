// components/Nav.js
import Link from 'next/link'
import { useRouter } from 'next/router'

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

export default function Nav() {
  const router = useRouter()

  return (
    <header className="top-nav">
      <div className="nav-container">
        <Link href="/" className="logo">InvestPro</Link>
        <nav className="nav-links">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${router.pathname === item.href ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <style jsx>{`
        .top-nav {
          background-color: #0070f3;
          color: white;
          padding: 0.8rem 1rem;
        }

        .nav-container {
          max-width: 1200px;
          margin: auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.4rem;
          font-weight: bold;
          color: white;
          text-decoration: none;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-weight: 500;
          padding: 0.4rem 0.6rem;
          border-radius: 5px;
          transition: background 0.2s ease-in-out;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .nav-link.active {
          background-color: white;
          color: #0070f3;
          font-weight: bold;
        }
      `}</style>
    </header>
  )
}
