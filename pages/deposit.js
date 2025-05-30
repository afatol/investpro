// pages/deposit.js
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
    if (!session) return window.location.href = '/login'

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
    const { error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
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
      <div className="deposit-container">
        <h1>Depositar</h1>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="form-deposit">
          <label>
            Valor do depósito (USD):
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <label>
            Comprovante (jpg, png ou pdf):
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Depósito'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .deposit-container {
          max-width: 600px;
          margin: auto;
          padding: 2rem;
        }

        h1 {
          margin-bottom: 1rem;
          text-align: center;
        }

        .form-deposit {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        label {
          font-weight: bold;
        }

        input[type="number"],
        input[type="file"] {
          width: 100%;
          padding: 0.5rem;
          margin-top: 0.3rem;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        button {
          background-color: #4CAF50;
          color: white;
          padding: 0.8rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
        }

        button:hover {
          background-color: #45a049;
        }

        button:disabled {
          background-color: #999;
          cursor: not-allowed;
        }

        .error {
          color: red;
          font-weight: bold;
        }

        @media (max-width: 500px) {
          .deposit-container {
            padding: 1rem;
          }
        }
      `}</style>
    </Layout>
  )
}
