import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export const Navbar = () => {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`

  return (
    <nav className="bg-white dark:bg-gray-900 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-4">
            <div className="text-lg w-15 h-15 text-amber-500 text-shadow-white font-bold"><img src="./img/insigniaNOQ.png" className='rounded-full' alt="" /></div>
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/" className={linkClass} end>
                Dashboard
              </NavLink>
              <NavLink to="/alumnos" className={linkClass}>
                Alumnos
              </NavLink>
              <NavLink to="/pagos" className={linkClass}>
                Pagos
              </NavLink>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <NavLink to="/registro" className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-primary text-white'}`}>
              Registrar
            </NavLink>
          </div>

          <div className="md:hidden">
            <button onClick={() => setOpen(!open)} className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              {open ? 'Cerrar' : 'Menú'}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1">
          <NavLink to="/" className={linkClass} end onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/alumnos" className={linkClass} onClick={() => setOpen(false)}>
            Alumnos
          </NavLink>
          <NavLink to="/pagos" className={linkClass} onClick={() => setOpen(false)}>
            Pagos
          </NavLink>
          <NavLink to="/registro" className={({ isActive }) => `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-green-600 text-white' : 'bg-primary text-white'}`} onClick={() => setOpen(false)}>
            Registrar
          </NavLink>
        </div>
      )}
    </nav>
  )
}

export default Navbar
