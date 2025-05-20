// pages/withdraw.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Nav from '../components/Nav'

export default function Withdraw() {
  const [amount, setAmount] = useState('')
  const [error, setError]   = useState('')

  const handle = async e => {
    e.preventDefault()
    setError('')
    const { data:{ session } } = await supabase.auth.getSession()
    if (!session) return window.location.href = '/login'
    const { error: insErr } = await supabase.from('transactions')
      .insert([{
        user_id:   session.user.id,
        amount:    parseFloat(amount),
        type:      'withdraw',
        proof_url: null,
        status:    'pending'
      }])
    if (insErr) setError(insErr.message)
    else window.location.href = '/dashboard'
  }

  return (
    <div className="container">
      <Nav />
      <h1>Sacar</h1>
      {error && <p style={{color:'red'}}>{error}</p>}
      <form onSubmit={handle}>
        <input
          type="number"
          placeholder="Valor em USD"
          required
          onChange={e=>setAmount(e.target.value)}
        />
        <button className="btn" type="submit">Solicitar Saque</button>
      </form>
    </div>
  )
}
