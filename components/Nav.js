// components/Nav.js
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    fetchUser()
  }, [])

  const isAdmin = user?.email === 'admin@investpro.com' // Altere para seu e-mail real

  return (
    <header className="header">
      <div className="logo-container">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="InvestPro"
            width={140}
            height={40}
            priority
          />
        </Link>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      <nav className={menuOpen ? 'open' : ''}>
        {user ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/planos">Planos</Link>
            <Link href="/deposit">Depositar</Link>
            <Link href="/withdraw">Sacar</Link>
            <Link href="/rendimentos">Rendimentos</Link>
            <Link href="/transacoes">Transações</Link>
            <Link href="/rede">Minha Rede</Link>
            <Link href="/manual">Manual de Uso</Link>
            <Link href="/sobre">Sobre</Link>
            {isAdmin && <Link href="/admin">Admin</Link>}
            <Link href="/logout">Sair</Link>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Registrar</Link>
            <Link href="/sobre">Sobre</Link>
          </>
        )}
      </nav>

      <style jsx>{`
        .header {
          display: flex;
          flex-direction: column;
          background: #0a0a23;
          padding: 0.8rem 1.2rem;
          color: white;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .logo-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        nav a {
          color: white;
          font-weight: 500;
          text-decoration: none;
        }

        nav a:hover {
          text-decoration: underline;
        }

        .menu-toggle {
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
        }

        @media (min-width: 768px) {
          .menu-toggle {
            display: none;
          }

          nav {
            margin-top: 0;
            flex-direction: row;
          }
        }

        @media (max-width: 767px) {
          nav {
            display: ${menuOpen ? 'flex' : 'none'};
            flex-direction: column;
            gap: 0.75rem;
            padding-top: 0.5rem;
          }
        }
      `}</style>
    </header>
  )
}
