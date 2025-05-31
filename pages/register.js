// pages/register.js

import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function RegisterPage() {
  const router = useRouter()

  // Estados para capturar entradas do usuário
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Função que será chamada ao submeter o formulário
  const handleSignUp = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // 1) Validações básicas de front-end
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios.')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Senha e confirmação não coincidem.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      // 2) Tenta registrar o usuário no Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
        {
          email: email.trim(),
          password
        },
        {
          data: {
            // Armazena o código de indicação como metadado, se houver
            referral_code: referralCode.trim() || null
          }
        }
      )

      if (signUpError) {
        // Erro genérico do Supabase (por exemplo, email já cadastrado, RLS etc.)
        throw signUpError
      }

      // 3) Opcional: se não tiver trigger em 'profiles', insira manualmente
      // const newUser = signUpData.user
      // const { error: profileError } = await supabase
      //   .from('profiles')
      //   .insert([
      //     {
      //       id: newUser.id,
      //       // Adicione aqui colunas obrigatórias, se existirem
      //       referral_code: referralCode.trim() || null,
      //       created_at: new Date()
      //     }
      //   ])
      // if (profileError) {
      //   await supabase.auth.admin.deleteUser(newUser.id)
      //   throw profileError
      // }

      // 4) Se chegou aqui sem erros, redireciona para a página de login
      router.push('/login')
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error.message)
      if (error.status === 500) {
        setErrorMsg(
          'Houve um problema no servidor ao salvar o usuário. ' +
            'Verifique as configurações do banco de dados ou tente novamente mais tarde.'
        )
      } else {
        setErrorMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div
        style={{
          maxWidth: '400px',
          margin: '2rem auto',
          padding: '1.5rem',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      >
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Cadastro de Usuário</h2>

        {errorMsg && (
          <div
            style={{
              backgroundColor: '#ffe5e5',
              color: '#a00',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem' }}>
            Email<span style={{ color: 'red' }}>*</span>:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />

          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem' }}>
            Senha<span style={{ color: 'red' }}>*</span>:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mínimo 6 caracteres"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />

          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.25rem' }}>
            Confirmar Senha<span style={{ color: 'red' }}>*</span>:
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="digite novamente a senha"
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />

          <label htmlFor="referralCode" style={{ display: 'block', marginBottom: '0.25rem' }}>
            Código de Indicação (opcional):
          </label>
          <input
            id="referralCode"
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="se tiver um código, informe aqui"
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#0069d9',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Enviando...' : 'Cadastrar'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Já possui conta?{' '}
          <a href="/login" style={{ color: '#0069d9', textDecoration: 'underline' }}>
            Fazer login
          </a>
        </p>
      </div>
    </Layout>
  )
}
