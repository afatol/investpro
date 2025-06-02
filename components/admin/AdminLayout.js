// ./components/admin/AdminLayout.js

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Copiei as cores e espaçamentos de acordo com o Nav de investidor.
// Se o Nav original usar alguma classe CSS (Tailwind ou módulo), adapte aqui para corresponder.
export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Se não estiver logado, joga para login
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
            // Se não for admin, joga para dashboard de investidor
            window.location.href = '/dashboard'
          }
        })
    })
  }, [])

  // Enquanto não souber se é admin ou não, não renderiza nada (evita “flash” de conteúdo errado)
  if (!user || !isAdmin) {
    return null
  }

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',       // copiar espaçamentos do Nav de investidor
          background: '#1976D2',        // mesma cor de fundo do Nav de investidor
          color: '#fff',
          fontFamily: '"Roboto", sans-serif', // mesma família de fonte
        }}
      >
        {/* Logo (mesmo texto e estilo) */}
        <div>
          <Link href="/admin">
            <a
              style={{
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontFamily: '"Roboto", sans-serif',
              }}
            >
              InvestPro <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Admin</span>
            </a>
          </Link>
        </div>

        {/* Links de menu identados para o admin */}
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/users">
            <a style={navLink}>Usuários</a>
          </Link>
          <Link href="/admin/transactions">
            <a style={navLink}>Transações</a>
          </Link>
          <Link href="/admin/rendimentos_aplicados">
            <a style={navLink}>Rendimentos</a>
          </Link>
          <Link href="/admin/plans">
            <a style={navLink}>Planos</a>
          </Link>
          {/* Suprimiremos Configurações gerais depois, pois você disse que não faz mais sentido */}
          <Link href="/admin/page_contents">
            <a style={navLink}>Páginas</a>
          </Link>
        </nav>

        {/* Botão “Voltar ao site” e “Sair” (mesmos estilos do Nav de investidor) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/">
            <a style={buttonLink}>Voltar ao Site</a>
          </Link>

          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            style={{
              marginLeft: '1rem',
              background: '#E53935',   // mesma cor de botão “Sair” do Nav
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontFamily: '"Roboto", sans-serif',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main style={{ padding: '1.5rem' }}>{children}</main>
    </>
  )
}

const navLink = {
  color: '#fff',
  textDecoration: 'none',
  fontWeight: '500',
  fontFamily: '"Roboto", sans-serif',
}

const buttonLink = {
  background: '#fff',
  color: '#1976D2',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: '500',
  fontFamily: '"Roboto", sans-serif',
}
