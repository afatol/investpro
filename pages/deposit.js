// pages/deposit.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Deposit() {
  const [amount, setAmount] = useState('')
  const [file, setFile]     = useState(null)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 1) sessão
    const { data:{ session } } = await supabase.auth.getSession()
    if (!session) return window.location.href = '/login'

    // 2) validações
    if (!amount || parseFloat(amount) <= 0) {
      return setError('Informe um valor de depósito válido.')
    }
    if (!file) {
      return setError('Selecione um comprovante.')
    }

    // 3) upload do comprovante
    const filePath = `${session.user.id}_${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase
      .storage
      .from('proofs')
      .upload(filePath, file)
    if (uploadError) {
      return setError(`Erro no upload: ${uploadError.message}`)
    }

    // 4) URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from('proofs')
      .getPublicUrl(filePath)

    // 5) inserir transação pendente
    const { error: insertError } = await supabase
      .from('transactions')
      .insert([{
        user_id:   session.user.id,
        amount:    parseFloat(amount),
        type:      'deposit',
        proof_url: publicUrl,
        status:    'pending'
      }])
    if (insertError) {
      return setError(`Erro ao registrar transação: ${insertError.message}`)
    }

    // 6) volta ao dashboard
    window.location.href = '/dashboard'
  }

  return (
    <div className="container">
      <Nav />
      <h1>Depositar</h1>

      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Valor do depósito (USD):
          <input
            type="number"
            step="0.01"
            placeholder="Ex: 100.00"
            value={amount}
            required
            onChange={e => setAmount(e.target.value)}
          />
        </label>

        <label>
          Comprovante (jpg, png ou pdf):
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            required
            onChange={e => setFile(e.target.files[0])}
          />
        </label>

        <button className="btn" type="submit">Enviar Depósito</button>
      </form>
    </div>
  )
}
