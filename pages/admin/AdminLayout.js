// components/admin/AdminLayout.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../Layout'

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
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
          if (!mounted) return
          if (error || !data?.is_admin) {
            // Se não for admin, redireciona para o dashboard normal
            window.location.href = '/dashboard'
          } else {
            setIsAdmin(true)
          }
          setLoading(false)
        })
    })

    return () => {
      mounted = false
    }
  }, [])

  // Enquanto a verificação não terminar, não exibe nada
  if (loading) {
    return null
  }

  // Se não é admin (ou não estiver logado), já redirecionamos lá no useEffect.
  // Quando chegar aqui, sabemos que `user` existe e `isAdmin === true`.
  return (
    <Layout>
      <header className="admin-header">
        <div className="logo">
          <Link href="/admin">
            <a>
              InvestPro <span className="subLogo">Admin</span>
            </a>
          </Link>
        </div>

        <nav className="admin-nav">
          <Link href="/admin/users">
            <a>Usuários</a>
          </Link>
          <Link href="/admin/transactions">
            <a>Transações</a>
          </Link>
          <Link href="/admin/rendimentos_aplicados">
            <a>Rendimentos</a>
          </Link>
          <Link href="/admin/plans">
            <a>Planos</a>
          </Link>
          <Link href="/admin/configs">
            <a>Configurações</a>
          </Link>
          <Link href="/admin/page_contents">
            <a>Páginas</a>
          </Link>
        </nav>

        <div className="admin-actions">
          <Link href="/">
            <a>Voltar ao Site</a>
          </Link>
          <button
            className="logout-btn"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className="admin-main">{children}</main>

      <style jsx>{`
        .admin-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          padding: 1rem 2rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .logo a {
          font-size: 1.25rem;
          font-weight: bold;
          color: #1e293b;
          text-decoration: none;
        }
        .subLogo {
          font-weight: normal;
          color: #475569;
          margin-left: 0.25rem;
          font-size: 1rem;
        }
        .admin-nav {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .admin-nav a {
          color: #334155;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .admin-nav a:hover {
          background-color: #f1f5f9;
        }
        .admin-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .admin-actions a {
          color: #1e293b;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .admin-actions a:hover {
          background-color: #f1f5f9;
        }
        .logout-btn {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .logout-btn:hover {
          background-color: #dc2626;
        }
        .admin-main {
          padding: 2rem;
          background-color: #f8fafc;
          min-height: calc(100vh - 70px);
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .admin-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-nav {
            margin-top: 1rem;
          }
          .admin-actions {
            margin-top: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
