// pages/profile.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function ProfilePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser({ ...user, ...data })
    }

    fetchUser()
  }, [])

  if (!user) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando perfil...</p>

  const referralCode = user.referral_code || '...'
  const referralLink = `https://investpro2025.netlify.app/register?ref=${referralCode}`

  return (
    <Layout>
      <div className="profile-container">
        <h1>Meu Perfil</h1>

        <div className="referral-card">
          <h2>Seu Código de Indicação</h2>
          <p><strong>Código:</strong> {referralCode}</p>
          <p>
            <strong>Link:</strong>{' '}
            <a href={referralLink} target="_blank" rel="noopener noreferrer">
              {referralLink}
            </a>
          </p>
          <button
            onClick={() => navigator.clipboard.writeText(referralLink)}
          >
            Copiar link
          </button>
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 600px;
          margin: 2rem auto;
          padding: 1rem;
          text-align: center;
        }

        .referral-card {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 1.5rem;
          background-color: #f9f9f9;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        button {
          margin-top: 1rem;
          padding: 0.7rem 1.4rem;
          border: none;
          border-radius: 6px;
          background-color: #4CAF50;
          color: white;
          cursor: pointer;
          font-size: 1rem;
        }

        button:hover {
          opacity: 0.9;
        }

        a {
          color: #1a73e8;
          word-break: break-word;
        }

        @media (max-width: 600px) {
          .referral-card {
            padding: 1rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}
