import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function Withdraw() {
  const [amount, setAmount] = useState('')
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const value = parseFloat(amount)
    if (!value || value <= 0) {
      setError('Informe um valor válido maior que zero.')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return window.location.href = '/login'

    const { error: insErr } = await supabase.from('transactions')
      .insert([{
        user_id: session.user.id,
        amount: value,
        type: 'withdraw',
        proof_url: null,
        status: 'pending'
      }])

    if (insErr) {
      setError(insErr.message)
    } else {
      setSuccess(true)
      setAmount('')
      setTimeout(() => window.location.href = '/dashboard', 1500)
    }
  }

  return (
    <Layout>
      <div className="container">
        <h1>Solicitar Saque</h1>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Saque solicitado com sucesso! Redirecionando...</p>}

        <form onSubmit={handle}>
          <input
            type="number"
            placeholder="Valor em USD"
            value={amount}
            required
            onChange={e => setAmount(e.target.value)}
          />
          <button className="btn" type="submit">Solicitar Saque</button>
        </form>
      </div>

      <style jsx>{`
        .container {
          max-width: 500px;
          margin: 2rem auto;
          padding: 1rem;
          text-align: center;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn:hover {
          background-color: #45a049;
        }

        @media (max-width: 500px) {
          .container {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
