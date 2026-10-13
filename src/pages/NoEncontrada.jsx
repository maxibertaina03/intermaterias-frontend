import { Link } from 'react-router-dom'

function NoEncontrada() {
  return (
    <section className="not-found">
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <Link to="/" className="back-link">
        Volver a Empresas
      </Link>
    </section>
  )
}

export default NoEncontrada
