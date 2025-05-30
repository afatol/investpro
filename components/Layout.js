// components/Layout.js
import Nav from './Nav'

export default function Layout({ children }) {
  return (
    <div>
      <Nav />
      <main className="page-content">{children}</main>
      <footer>© InvestPro 2025</footer>
    </div>
  )
}
