import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Empresas from './pages/Empresas.jsx'
import EmpresaForm from './pages/EmpresaForm.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Empresas />} />
          <Route path="/empresas/nueva" element={<EmpresaForm />} />
          <Route path="/empresas/:id/editar" element={<EmpresaForm />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </>
  )
}

export default App
