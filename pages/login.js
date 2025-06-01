import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const ensureProfile = async (user) => {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile && !fetchError) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || ''
      })

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError)
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      const user = data.user
      await ensureProfile(user)
      router.push('/dashboard')
    }
  }

  return (
    <Layout>
      <div className="login-container">
        <div className="form-card">
          <h1>Login</h1>
          {error && <p className="error">{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="links">
            <Link href="/forgot-password">Esqueci a senha</Link>
            <span> | </span>
            <Link href="/register">Cadastre-se</Link>
            <span> | </span>
            <Link href="/">Voltar</Link>
          </div>
        </div>
      </div>
   </Layout>
  )
}
