// File: ./components/admin/AdminLayout.js

import Link from 'next/link'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.href = '/login'
        return
      }
      setUser(session.user)
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data?.is_admin) {
            setIsAdmin(true)
          } else {
            window.location.href = '/dashboard'
          }
        })
    })
  }, [])

  if (!user || !isAdmin) {
    return null
  }

  const navItems = [
    { label: 'Usuários', href: '/admin/users' },
    { label: 'Transações', href: '/admin/transactions' },
    { label: 'Rendimentos', href: '/admin/rendimentos_aplicados' },
    { label: 'Planos', href: '/admin/plans' },
    { label: 'Páginas', href: '/admin/page_contents' },
  ]

  return (
    <div className="layout-wrapper">
      <nav className="top-nav">
        <div className="nav-container">
          <Link href="/admin">
            <div className="logo" role="button">
              <Image
                src="/logo.png"
                alt="InvestPro Admin"
                width={130}
                height={38}
                priority
              />
            </div>
          </Link>

          <div className="nav-links">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`nav-link ${
                    router.pathname.startsWith(item.href) ? 'active' : ''
                  }`}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="btn"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">{children}</main>

      <footer className="site-footer">
        © InvestPro Admin 2025 — Todos os direitos reservados
      </footer>

      <style jsx>{`
        .layout-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        /* ============================
           TOPO FIXO (MENU) 
           ============================ */
        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 64px; /* Altura do nav */
          background-color: #fff; /* fundo branco */
          color: #333;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }

        .logo {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        /* ============================
           LINKS DO MENU 
           ============================ */
        .nav-links {
          display: flex;
          gap: 2rem; /* espaçamento aumentado */
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-link {
          color: #333; /* cor escura para contraste */
          text-decoration: none;
          font-weight: 500;
          padding: 0.4rem 0.6rem;
          border-radius: 4px;
          transition: background 0.2s ease-in-out;
        }

        .nav-link:hover {
          background: #f0f0f0;
        }

        .nav-link.active {
          background-color: #1976d2;
          color: #fff;
          font-weight: bold;
        }

        /* ============================
           AÇÕES DO MENU (Botão “Sair”) 
           ============================ */
        .nav-actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          background-color: #e53935;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .btn:hover {
          background-color: #ab2424;
        }

        /* ============================
           CORPO (MAIN), deslocado para baixo
           ============================ */
        .page-content {
          margin-top: 64px; /* mesma altura do nav, para não sobrepor */
          flex-grow: 1;
          padding: 2rem 1rem;
          max-width: 1200px;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }

        /* ============================
           RODAPÉ 
           ============================ */
        .site-footer {
          text-align: center;
          font-size: 0.9rem;
          padding: 1rem;
          background-color: #fafafa;
          border-top: 1px solid #eee;
          margin-top: auto;
        }

        @media (max-width: 768px) {
          .nav-links {
            gap: 1rem;
          }
          .nav-container {
            padding: 0 1rem;
          }
        }

        @media (max-width: 480px) {
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
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
