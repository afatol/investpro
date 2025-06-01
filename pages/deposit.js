// pages/deposit.js

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Layout from '../components/Layout'

export default function DepositPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Verifica sessão logo ao carregar a página
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/login')
    })
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Busca a sessão novamente
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      setError('Você precisa estar logado para depositar.')
      setLoading(false)
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

    const userId = session.user.id
    const timestamp = Date.now()
    const filePath = `${userId}_${timestamp}_${file.name}`

    // 1) Upload para o bucket "proofs"
    const { error: uploadError } = await supabase.storage
      .from('proofs')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`)
      setLoading(false)
      return
    }

    // 2) Recupera a URL pública se quiser exibir depois (opcional)
    const { data: { publicUrl } } = supabase.storage
      .from('proofs')
      .getPublicUrl(filePath)

    // 3) Insere a transação no banco
    const { error: insertError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: parseFloat(amount),
          type: 'deposit',
          proof_url: publicUrl,
          status: 'pending',
          data: new Date().toISOString()
        },
      ])

    if (insertError) {
      setError(`Erro ao registrar transação: ${insertError.message}`)
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
        input[type='number'],
        input[type='file'] {
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
