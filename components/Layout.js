// components/Layout.js
import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div>
      <Nav />
      <main className="page-content" key="layout-main">
        {children}
      </main>
      <footer className="site-footer">
        © InvestPro 2025 — Todos os direitos reservados
      </footer>
    </div>
  )
}
