// pages/login.js
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setError(error.message)
    else window.location.href = '/dashboard'
  }

  return (
    <div className="login-container">
      <Nav />
      <div className="form-card">
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            required
            onChange={e => setSenha(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>

        <div className="links">
          <Link href="/forgot-password">Esqueci senha</Link>
          <span> | </span>
          <Link href="/register">Cadastre-se</Link>
          <span> | </span>
          <Link href="/">Voltar</Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
        }

        .form-card {
          width: 100%;
          max-width: 400px;
          background: #fff;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
        }

        button:hover {
          background-color: #45a049;
        }

        .error {
          color: red;
          margin-bottom: 1rem;
          text-align: center;
        }

        .links {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.95rem;
        }

        .links a {
          color: #1a73e8;
          text-decoration: none;
        }

        .links a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .form-card {
            padding: 1.5
