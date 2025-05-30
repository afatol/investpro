import Link from 'next/link'
import Layout from '../components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="home-container">
        <h1>Bem-vindo à <span className="highlight">InvestPro</span></h1>
        <p className="subtitle">Invista com praticidade, segurança e transparência.</p>

        <div className="buttons">
          <Link href="/login">
            <button className="btn primary">Login</button>
          </Link>
          <Link href="/register">
            <button className="btn outline">Cadastre-se</button>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .home-container {
          max-width: 600px;
          margin: auto;
          padding: 3rem 1.5rem;
          text-align: center;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .highlight {
          color: #1976D2;
        }

        .subtitle {
          font-size: 1.1rem;
          color: #555;
        }

        .buttons {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .btn.primary {
          background-color: #1976D2;
          color: white;
          border: none;
        }

        .btn.primary:hover {
          background-color: #125ca1;
        }

        .btn.outline {
          background-color: white;
          color: #1976D2;
          border: 2px solid #1976D2;
        }

        .btn.outline:hover {
          background-color: #f0f0f0;
        }

        @media (max-width: 480px) {
          .buttons {
            flex-direction: column;
            gap: 0.75rem;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}
