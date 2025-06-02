import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabaseClient'

export default function AdminConfigs() {
  const [config, setConfig] = useState(null)
  const [rendimentoDiario, setRendimentoDiario] = useState('')
  const [textoAviso, setTextoAviso] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error: err } = await supabase
          .from('admin_configs')
          .select('id, rendimento_diario, texto_aviso, atualizado_em')
          .limit(1)
          .single()
        if (err && err.code !== 'PGRST116') throw err
        if (data) {
          setConfig(data)
          setRendimentoDiario(data.rendimento_diario || '')
          setTextoAviso(data.texto_aviso || '')
        }
      } catch (err) {
        console.error(err)
        setError('Falha ao carregar configurações.')
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const saveConfig = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (config) {
        await supabase
          .from('admin_configs')
          .update({
            rendimento_diario: rendimentoDiario || null,
            texto_aviso: textoAviso || null,
          })
          .eq('id', config.id)
      } else {
        const { error: err } = await supabase
          .from('admin_configs')
          .insert({
            rendimento_diario: rendimentoDiario || null,
            texto_aviso: textoAviso || null,
          })
        if (err) throw err
      }
      alert('Configurações salvas!')
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar configurações.')
    }
  }

  if (loading) {
    return (
      <Layout>
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando configurações...</p>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="admin-configs">
        <h1>Configurações Gerais</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={saveConfig} className="config-form">
          <label>Rendimento Diário (%):</label>
          <input
            type="number"
            step="0.01"
            value={rendimentoDiario}
            onChange={(e) => setRendimentoDiario(e.target.value)}
          />

          <label>Texto de Aviso (banner):</label>
          <textarea
            rows="4"
            value={textoAviso}
            onChange={(e) => setTextoAviso(e.target.value)}
          />

          <button type="submit">Salvar</button>
        </form>

        {config && (
          <p className="updated">
            Última atualização:{' '}
            {new Date(config.atualizado_em).toLocaleString()}
          </p>
        )}
      </div>

      <style jsx>{`
        .admin-configs {
          max-width: 600px;
          margin: auto;
          padding: 2rem 1rem;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .config-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        label {
          font-weight: 600;
        }
        input,
        textarea {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          width: 100%;
        }
        button {
          margin-top: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background: #005bb5;
        }
        .error {
          color: red;
          text-align: center;
          margin-bottom: 1rem;
        }
        .updated {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #555;
          text-align: center;
        }
      `}</style>
    </Layout>
  )
}
