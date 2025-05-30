// components/Nav.js
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="logo-container">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="InvestPro"
            width={140}
            height={40}
            priority
          />
        </Link>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      <nav className={menuOpen ? 'open' : ''}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/planos">Planos</Link>
        <Link href="/deposit">Depositar</Link>
        <Link href="/withdraw">Sacar</Link>
        <Link href="/rendimentos">Rendimentos</Link>
        <Link href="/rede">Minha Rede</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/manual">Manual de Uso</Link>
        <Link href="/logout">Sair</Link>
      </nav>
    </header>
  )
}
