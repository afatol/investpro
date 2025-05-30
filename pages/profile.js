// pages/profile.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function ProfilePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar dados adicionais no perfil
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({ ...user, ...data })
    }

    fetchUser()
  }, [])

  if (!user) return <p>Carregando...</p>

  const referralCode = user.referral_code || 'Carregando...'
  const referralLink = `https://investpro2025.netlify.app/register?ref= ${referralCode}`

  return (
    <Layout>
      <div className="profile">
        <h1>Perfil</h1>

        <section className="referral-section">
          <h2>Seu Código de Indicação</h2>
          <p><strong>Código:</strong> {referralCode}</p>
          <p>
            <strong>Link de indicação:</strong>{' '}
            <a href={referralLink} target="_blank" rel="noopener noreferrer">
              {referralLink}
            </a>
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(referralLink)}
          >
            Copiar link
          </button>
        </section>
      </div>
    </Layout>
  )
}