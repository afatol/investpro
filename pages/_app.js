import '../styles/globals.css'
import '../styles/layout.css'
import Head from 'next/head'

/**
 * Aplica CSS global e configurações padrão a todas as páginas.
 */
export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>InvestPro</title>
        <meta name="description" content="Plataforma de investimentos simples e segura" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
