import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    referral_code: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { name, email, password, confirmPassword, phone_number, referral_code } = formData

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone_number,
          referral_code
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      router.push('/login')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Criar Conta</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="name" placeholder="Nome" onChange={handleChange} required className="w-full p-2 border" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 border" />
        <input type="password" name="password" placeholder="Senha" onChange={handleChange} required className="w-full p-2 border" />
        <input type="password" name="confirmPassword" placeholder="Confirmar Senha" onChange={handleChange} required className="w-full p-2 border" />
        <input type="text" name="phone_number" placeholder="Telefone" onChange={handleChange} className="w-full p-2 border" />
        <input type="text" name="referral_code" placeholder="Código de Indicação (opcional)" onChange={handleChange} className="w-full p-2 border" />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 w-full">
          {loading ? 'Criando conta...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
