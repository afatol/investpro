import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/login'
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Informe um valor de depósito válido.')
      setLoading(false)
      return
    }

    if (!file) {
      setError('Selecione um comprovante.')
      setLoading(false)
      return
    }

    const filePath = `${session.user.id}_${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, file)

    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(filePath)

    const { error: insertError } = await supabase.from('transactions').insert([{
      user_id: session.user.id,
      amount: parseFloat(amount),
      type: 'deposit',
      proof_url: publicUrl,
      status: 'pending'
    }])

    if (insertError) {
      setError(`Erro ao registrar transação: ${insertError.message}`)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <Layout>
      <div className="deposit-page">
        <h1>Realizar Depósito</h1>

        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit} className="deposit-form">
          <label htmlFor="amount">Valor (USD):</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 100.00"
            required
          />

          <label htmlFor="proof">Comprovante (jpg, png ou pdf):</label>
          <input
            type="file"
            id="proof"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Depósito'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .deposit-page {
          max-width: 540px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        h1 {
          text-align: center;
          font-size: 1.6rem;
          margin-bottom: 1.5rem;
        }

        .deposit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: 600;
          margin-bottom: 0.2rem;
        }

        input[type="number"],
        input[type="file"] {
          padding: 0.6rem;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        button {
          padding: 0.75rem;
          font-size: 1rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: #005bb5;
        }

        button:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }

        .error-msg {
          color: #d00000;
          font-weight: bold;
          text-align: center;
        }

        @media (max-width: 640px) {
          .deposit-page {
            padding: 1rem;
            margin: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
