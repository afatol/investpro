// components/Nav.js
import Image from 'next/image'
import Link from 'next/link'

export default function Nav() {
  return (
    <header className="header">
      <div className="logo-container">
        {/* Logo clicável leva à home */}
        <Link href="/">
          <Image
            src="/logo.png"
            alt="InvestPro"
            width={140}
            height={40}
            priority
          />
        </Link>
      </div>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/planos">Planos</Link>
        <Link href="/deposit">Depositar</Link>
        <Link href="/withdraw">Sacar</Link>
        <Link href="/rede">Minha Rede</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/manual">Manual de Uso</Link>
        <Link href="/logout">Sair</Link>
      </nav>
    </header>
  )
}
