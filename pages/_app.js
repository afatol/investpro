// pages/_app.js
import '../styles/globals.css'
import '../styles/layout.css'

/**
 * Aplica CSS global e layout em todas as páginas.
 */
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}
