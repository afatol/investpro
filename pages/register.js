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

    if (!name || !email || !password || !confirmPassword || !phone_number || !referral_code) {
      setError('Preencha todos os campos obrigatórios.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    // Valida o código de indicação
    const { data: refData, error: refError } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referral_code)
      .single()

    if (refError || !refData) {
      setError('Código de indicação inválido')
      setLoading(false)
      return
    }

    // Cria o usuário
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message || 'Erro ao criar conta')
      setLoading(false)
      return
    }

    // Cria o profile associado
    const { error: profileError } = await supabase.from('profiles').insert({
      id: signUpData.user.id,
      name,
      email,
      celular: phone_number,
      referrer_id: refData.id
    })

    if (profileError) {
      setError('Erro ao salvar dados do perfil')
      setLoading(false)
      return
    }

    router.push('/login')
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
        <input type="text" name="phone_number" placeholder="Telefone (obrigatório)" onChange={handleChange} required className="w-full p-2 border" />
        <input type="text" name="referral_code" placeholder="Código de Indicação (obrigatório)" onChange={handleChange} required className="w-full p-2 border" />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 w-full">
          {loading ? 'Criando conta...' : 'Registrar'}
        </button>
      </form>
    </div>
  )
}
