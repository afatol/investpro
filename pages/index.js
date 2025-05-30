// pages/index.js
import Link from 'next/link'
import Layout from '../components/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="home-container">
        <h1>Bem-vindo à InvestPro</h1>
        <p>Invista com praticidade, segurança e transparência.</p>

        <div className="buttons">
          <Link href="/login"><button className="btn">Login</button></Link>
          <Link href="/register"><button className="btn outline">Cadastre-se</button></Link>
        </div>
      </div>

      <style jsx>{`
        .home-container {
          max-width: 600px;
          margin: auto;
          padding: 2rem;
          text-align: center;
        }

        .buttons {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .btn {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          background-color: #4CAF50;
          color: white;
        }

        .btn.outline {
          background-color: white;
          color: #4CAF50;
          border: 2px solid #4CAF50;
        }

        .btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 500px) {
          .buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  )
}
