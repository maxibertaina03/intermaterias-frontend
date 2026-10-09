import { NavLink } from 'react-router-dom'

function Navbar() {
  const linkClass = ({ isActive }) => (isActive ? 'active' : undefined)

  return (
    <nav className="navbar">
      <NavLink to="/" className={linkClass} end>
        Empresas
      </NavLink>
      <NavLink to="/empresas/nueva" className={linkClass}>
        Nueva empresa
      </NavLink>
    </nav>
  )
}

export default Navbar
