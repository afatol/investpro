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
    const { error: uploadError } = await supabase
      .storage
      .from('proofs')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('proofs')
      .getPublicUrl(filePath)

    const { error: insertError } = await supabase
      .from('transactions')
      .insert([{
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
      <div className="form-wrapper">
        <h1>Realizar Depósito</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="deposit-form">
          <label htmlFor="amount">Valor (USD):</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            placeholder="Ex: 100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label htmlFor="proof">Comprovante (jpg, png ou pdf):</label>
          <input
            id="proof"
            type="file"
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
        .form-wrapper {
          background: white;
          max-width: 500px;
          margin: auto;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .deposit-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: 600;
        }

        input[type="number"],
        input[type="file"] {
          padding: 0.6rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
        }

        button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          font-weight: bold;
          transition: background 0.3s;
        }

        button:hover {
          background-color: #005bb5;
        }

        button:disabled {
          background-color: #aaa;
          cursor: not-allowed;
        }

        .error {
          color: #b00020;
          font-weight: bold;
          text-align: center;
        }

        @media (max-width: 600px) {
          .form-wrapper {
            padding: 1.5rem 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
