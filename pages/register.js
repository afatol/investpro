// pages/register.js

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Register() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [refCode, setRefCode] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // 1) Criar usuário (signUp retorna data.user.id)
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password: senha
    })
    if (signErr) {
      return setError(signErr.message)
    }
    const userId = data.user.id

    // 2) Gerar código de indicação próprio (sempre)
    const myCode = 'FX' + Math.random().toString(36).slice(2, 8).toUpperCase()

    // 3) Montar objeto para user_profiles
    const profileObj = { user_id: userId, referral_code: myCode }
    if (refCode) {
      // tenta achar quem indicou
      const { data: referrer, error: refErr } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('referral_code', refCode)
        .single()
      if (!refErr && referrer?.user_id) {
        profileObj.referred_by = referrer.user_id
      }
    }

    // 4) Inserir em user_profiles
    const { error: insertErr } = await supabase
      .from('user_profiles')
      .insert([ profileObj ])
    if (insertErr) {
      console.error('Erro ao criar perfil:', insertErr)
      return setError('Falha ao salvar perfil: ' + insertErr.message)
    }

    // 5) Redireciona para login (e-mail pode precisar de confirmação)
    window.location.href = '/login'
  }

  return (
    <div className="container">
      <Nav />
      <h1>Cadastro</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          required
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />
        <input
          type="text"
          placeholder="Código de Indicação (opcional)"
          value={refCode}
          onChange={e => setRefCode(e.target.value.trim())}
        />
        <button className="btn" type="submit">Cadastrar</button>
      </form>
      <p className="links">
        <Link href="/login">Já tenho conta</Link> |{' '}
        <Link href="/">Voltar</Link>
      </p>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 1.5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          text-align: center;
        }
        h1 {
          margin-bottom: 1rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        input {
          padding: 0.5rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .btn {
          margin-top: 0.5rem;
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn:hover {
          background-color: #005bb5;
        }
        .links {
          margin-top: 1rem;
          font-size: 0.9rem;
        }
        .error {
          color: #c00;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  )
}
