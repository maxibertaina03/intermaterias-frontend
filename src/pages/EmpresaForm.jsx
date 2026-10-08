import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearEmpresa } from '../services/empresasService.js'

const campos = [
  { name: 'nombre', label: 'Nombre', required: true },
  { name: 'cuit', label: 'CUIT', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telefono', label: 'Teléfono', type: 'tel' },
  { name: 'direccion', label: 'Dirección' },
]

function EmpresaForm() {
  const [form, setForm] = useState({
    nombre: '',
    cuit: '',
    email: '',
    telefono: '',
    direccion: '',
  })
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const navigate = useNavigate()

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
      await crearEmpresa(form)
      navigate('/')
    } catch (error) {
      setErrores({
        api: error.response?.data?.mensaje || 'Error al crear la empresa',
      })
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="empresa-form-page">
      <h1>Nueva empresa</h1>
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
            {guardando ? 'Guardando…' : 'Crear empresa'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default EmpresaForm
