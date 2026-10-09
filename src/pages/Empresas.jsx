import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eliminarEmpresa, obtenerEmpresas } from '../services/empresasService.js'

function Empresas() {
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eliminando, setEliminando] = useState(null)

  useEffect(() => {
    let activa = true

    const cargarEmpresas = async () => {
      try {
        const response = await obtenerEmpresas()
        if (activa) setEmpresas(response.data)
      } catch {
        if (activa) setError('No se pudieron cargar las empresas. Intenta nuevamente.')
      } finally {
        if (activa) setLoading(false)
      }
    }

    cargarEmpresas()
    return () => {
      activa = false
    }
  }, [])

  const handleEliminar = async (empresa) => {
    const confirmado = window.confirm(`¿Eliminar a ${empresa.nombre}? Esta acción no se puede deshacer.`)
    if (!confirmado) return

    setError('')
    setEliminando(empresa.id_empresa)
    try {
      await eliminarEmpresa(empresa.id_empresa)
      setEmpresas((actuales) => actuales.filter((item) => item.id_empresa !== empresa.id_empresa))
    } catch {
      setError('No se pudo eliminar la empresa. Puede que ya no exista.')
    } finally {
      setEliminando(null)
    }
  }

  return (
    <section className="empresas-page" aria-labelledby="empresas-titulo">
      <header className="empresas-header">
        <div>
          <p className="empresas-eyebrow">Directorio</p>
          <h1 id="empresas-titulo">Empresas</h1>
          <p className="empresas-intro">Consulta y administra las empresas registradas.</p>
        </div>
        <Link className="empresa-nueva" to="/empresas/nueva">Agregar empresa</Link>
      </header>

      {error && <p className="empresas-alert" role="alert">{error}</p>}
      {loading ? (
        <p className="empresas-state" role="status">Cargando empresas...</p>
      ) : error && empresas.length === 0 ? null : (
        empresas.length === 0 ? (
          <div className="empresas-empty">
            <h2>Aún no hay empresas</h2>
            <p>Agrega la primera empresa para verla en este listado.</p>
          </div>
        ) : (
          <div className="empresas-table-wrap">
            <table className="empresas-table">
              <thead>
                <tr>
                  <th scope="col">Empresa</th>
                  <th scope="col">CUIT</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Teléfono</th>
                  <th scope="col">Estado</th>
                  <th scope="col"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa.id_empresa}>
                    <th scope="row">{empresa.nombre}</th>
                    <td>{empresa.cuit || '—'}</td>
                    <td>{empresa.email || '—'}</td>
                    <td>{empresa.telefono || 'Sin dato'}</td>
                    <td>{empresa.activo ? 'Activa' : 'Inactiva'}</td>
                    <td className="empresa-actions">
                      <Link to={`/empresas/${empresa.id_empresa}/editar`}>Editar</Link>
                      <button
                        type="button"
                        className="empresa-delete"
                        onClick={() => handleEliminar(empresa)}
                        disabled={eliminando === empresa.id_empresa}
                      >
                        {eliminando === empresa.id_empresa ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  )
}

export default Empresas
