<style jsx>{`
  .rendimentos {
    max-width: 900px;
    margin: 2rem auto;
    padding: 1rem;
  }

  h1, h2 {
    text-align: center;
    margin-bottom: 1rem;
  }

  .filtros {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    align-items: flex-end;
    margin-bottom: 2rem;
  }

  .filtro-group {
    display: flex;
    flex-direction: column;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 1rem;
    min-width: 150px;
  }

  button {
    padding: 0.6rem 1.2rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: auto;
  }

  button:hover {
    background-color: #45a049;
  }

  .grafico {
    margin-bottom: 3rem;
  }

  .transacoes {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.8rem;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f5f5f5;
  }

  .status {
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-weight: bold;
    text-transform: capitalize;
  }

  .status.approved {
    background-color: #d4edda;
    color: #155724;
  }

  .status.pending {
    background-color: #fff3cd;
    color: #856404;
  }

  .status.rejected {
    background-color: #f8d7da;
    color: #721c24;
  }

  @media (max-width: 600px) {
    .filtros {
      flex-direction: column;
      align-items: stretch;
    }

    select, button {
      width: 100%;
    }

    table {
      font-size: 0.9rem;
    }
  }
`}</style>
