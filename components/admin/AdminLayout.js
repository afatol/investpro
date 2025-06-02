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

  // Verifica sessão e se é admin
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

  // Enquanto não souber se é admin, não renderiza nada
  if (!user || !isAdmin) {
    return null
  }

  // Itens do menu de admin (mesmos estilos do nav “Investidor”)
  const navItems = [
    { label: 'Usuários', href: '/admin/users' },
    { label: 'Transações', href: '/admin/transactions' },
    { label: 'Rendimentos', href: '/admin/rendimentos_aplicados' },
    { label: 'Planos', href: '/admin/plans' },
    { label: 'Páginas', href: '/admin/page_contents' },
    // + Voltar ao Site e Sair ficam fora do navLinks, abaixo
  ]

  return (
    <div className="layout-wrapper">
      <nav className="top-nav">
        <div className="nav-container">
          {/* Logo igual ao do investidor */}
          <Link href="/admin">
            <div className="logo" style={{ cursor: 'pointer' }}>
              <Image
                src="/logo.png"
                alt="InvestPro Admin"
                width={130}
                height={38}
                priority
              />
            </div>
          </Link>

          {/* Links de navegação de admin */}
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

          {/* Voltar ao Site + Sair */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/">
              <a className="btn outline">Voltar ao Site</a>
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="btn"
              style={{ backgroundColor: '#e53935', marginLeft: '0.5rem' }}
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

      {/* Não é necessário duplicar CSS aqui, pois ele já existe em globals.css */}
    </div>
  )
}
