// File: ./components/admin/AdminLayout.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Este layout será o “container” de todas as páginas /admin. 
// Não há import de CSS módulo; usamos estilos in-line para manter algo mínimo.

export default function AdminLayout({ children }) {
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

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        background: '#1976D2',
        color: '#fff'
      }}>
        <div>
          <Link href="/admin">
            <a style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none' }}>
              InvestPro <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Admin</span>
            </a>
          </Link>
        </div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/users"><a style={navLink}>Usuários</a></Link>
          <Link href="/admin/transactions"><a style={navLink}>Transações</a></Link>
          <Link href="/admin/rendimentos_aplicados"><a style={navLink}>Rendimentos</a></Link>
          <Link href="/admin/plans"><a style={navLink}>Planos</a></Link>
          <Link href="/admin/configs"><a style={navLink}>Configurações</a></Link>
          <Link href="/admin/page_contents"><a style={navLink}>Páginas</a></Link>
        </nav>
        <div>
          <Link href="/"><a style={buttonLink}>Voltar ao Site</a></Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            style={{
              marginLeft: '1rem',
              background: '#e53935',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
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
  fontWeight: '500'
}

const buttonLink = {
  background: '#fff',
  color: '#1976D2',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  textDecoration: 'none',
  fontWeight: '500'
}
