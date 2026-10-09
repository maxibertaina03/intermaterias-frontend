import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { actualizarEmpresa, crearEmpresa, obtenerEmpresa } from '../services/empresasService.js'

const campos = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'cuit', label: 'CUIT', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'direccion', label: 'Dirección' },
]

const formVacio = {
  nombre: '',
  cuit: '',
  email: '',
  telefono: '',
  direccion: '',
}

function EmpresaForm() {
  const { id } = useParams()
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(Boolean(id))
  const [noEncontrada, setNoEncontrada] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return

    let activa = true
    setCargando(true)
    setNoEncontrada(false)

    obtenerEmpresa(id)
      .then(({ data }) => {
        if (!activa) return
        setForm({
          nombre: data.nombre ?? '',
          cuit: data.cuit ?? '',
          email: data.email ?? '',
          telefono: data.telefono ?? '',
          direccion: data.direccion ?? '',
        })
      })
      .catch((error) => {
        if (!activa) return
        if (error.response?.status === 404) setNoEncontrada(true)
      })
      .finally(() => {
        if (activa) setCargando(false)
      })

    return () => {
      activa = false
    }
  }, [id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((actual) => ({ ...actual, [name]: value }))
    setErrores((actuales) => ({ ...actuales, [name]: undefined, api: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nuevosErrores = {}
    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!form.cuit.trim()) nuevosErrores.cuit = 'El CUIT es obligatorio'
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setGuardando(true)
    try {
      const datosEmpresa = {
        ...form,
        email: form.email.trim() ? form.email : null,
        telefono: form.telefono.trim() ? form.telefono : null,
        direccion: form.direccion.trim() ? form.direccion : null,
      }
      if (id) {
        await actualizarEmpresa(id, datosEmpresa)
      } else {
        await crearEmpresa(datosEmpresa)
      }
      navigate('/')
    } catch (error) {
      setErrores({
        api:
          error.response?.data?.mensaje ||
          (id ? 'Error al editar la empresa' : 'Error al crear la empresa'),
      })
    } finally {
      setGuardando(false)
    }
  }

  if (noEncontrada) {
    return (
      <section className="empresa-form-page">
        <h1>Empresa no encontrada</h1>
        <button type="button" className="button-secondary" onClick={() => navigate('/')}>
          Volver al listado
        </button>
      </section>
    )
  }

  if (cargando) {
    return (
      <section className="empresa-form-page">
        <p role="status">Cargando empresa...</p>
      </section>
    )
  }

  return (
    <section className="empresa-form-page">
      <h1>{id ? 'Editar empresa' : 'Nueva empresa'}</h1>
      <form className="empresa-form" onSubmit={handleSubmit} noValidate>
        {campos.map(({ name, label, type = 'text', required }) => (
          <div className="form-field" key={name}>
            <label htmlFor={name}>
              {label}{required ? ' *' : ''}
            </label>
            <input
              id={name}
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              aria-invalid={Boolean(errores[name])}
              aria-describedby={errores[name] ? `${name}-error` : undefined}
              required={required}
            />
            {errores[name] && (
              <p className="form-error" id={`${name}-error`} role="alert">
                {errores[name]}
              </p>
            )}
          </div>
        ))}

        {errores.api && <p className="form-error api-error" role="alert">{errores.api}</p>}

        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={() => navigate('/')}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : id ? 'Guardar cambios' : 'Crear empresa'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default EmpresaForm
