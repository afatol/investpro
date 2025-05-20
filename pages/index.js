// pages/index.js
import Link from 'next/link'
import Nav from '../components/Nav'

export default function Home() {
  return (
    <div className="container">
      <Nav />
      <h1>InvestPro</h1>
      <p>Invista de forma simples e segura.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
        <Link href="/login"><button className="btn">Login</button></Link>
        <Link href="/register"><button className="btn outline">Cadastre-se</button></Link>
      </div>
    </div>
  )
}
