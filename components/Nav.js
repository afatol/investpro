// components/Nav.js
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setUser(session.user)
      else setUser(null)
    }
    checkUser()
  }, [])

  const isAdmin = user?.email === 'admin@investpro.com' // Altere este e-mail se quiser

  const loggedInLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/planos', label: 'Planos' },
    { href: '/deposit', label: 'Depositar' },
    { href: '/withdraw', label: 'Sacar' },
    { href: '/rendimentos', label: 'Rendimentos' },
    { href: '/transacoes', label: 'Transações' },
    { href: '/rede', label: 'Minha Rede' },
    { href: '/manual', label: 'Manual de Uso' },
    { href: '/sobre', label: 'Sobre' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
    { href: '/logout', label: 'Sair' }
  ]

  const loggedOutLinks = [
    { href: '/login', label: 'Entrar' },
    { href: '/register', label: 'Registrar' },
    { href: '/sobre', label: 'Sobre' }
  ]

  const linksToShow = user ? loggedInLinks : loggedOutLinks

  return (
    <header className="nav-header">
      <div className="nav-container">
        <Link href="/" className="logo">
          <Image
            src="/logo.png"
            alt="InvestPro"
            width={140}
            height={40}
            priority
          />
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {linksToShow.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={router.pathname === href ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <style jsx>{`
        .nav-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          padding: 1rem;
          margin: auto;
        }

        .logo {
          display: flex;
          align-items: center;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 1.8rem;
          cursor: pointer;
        }

        .nav-links {
          display: flex;
          gap: 1.2rem;
        }

        .nav-links a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover,
        .nav-links a.active {
          color: #0070f3;
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-links {
            display: ${menuOpen ? 'flex' : 'none'};
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            background: white;
            padding: 1rem;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }

          .nav-links a {
            padding: 0.8rem 0;
            border-bottom: 1px solid #eee;
          }
        }
      `}</style>
    </header>
  )
}
