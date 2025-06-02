// File: ./pages/admin/configs/index.js

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AdminConfigsPage() {
  const router = useRouter()

  // Redireciona automaticamente para /admin/plans, pois “Configurações Gerais” foi suprimida
  useEffect(() => {
    router.replace('/admin/plans')
  }, [router])

  return null
}
