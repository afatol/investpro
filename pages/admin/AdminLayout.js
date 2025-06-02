// components/admin/AdminLayout.js
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Pega sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Se não estiver logado, redireciona pro login (ou '/dashboard' do investidor)
        window.location.href = '/login'
        return
      }
      setUser(session.user)

      // Verifica no perfil se é admin
      supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data?.is_admin) {
            setIsAdmin(true)
          } else {
            // Se não for admin, manda pra dashboard normal
            window.location.href = '/dashboard'
          }
        })
    })
  }, [])

  // Enquanto não sabemos se é admin, não renderiza nada
  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link href="/admin">
            <a>InvestPro <span className={styles.subLogo}>Admin</span></a>
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/users"><a>Usuários</a></Link>
          <Link href="/admin/transactions"><a>Transações</a></Link>
          <Link href="/admin/rendimentos_aplicados"><a>Rendimentos</a></Link>
          <Link href="/admin/plans"><a>Planos</a></Link>
          <Link href="/admin/configs"><a>Configurações</a></Link>
          <Link href="/admin/page_contents"><a>Páginas</a></Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/"><a>Voltar ao Site</a></Link>
          <button
            className={styles.logoutBtn}
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>{children}</main>
    </div>
  )
}
