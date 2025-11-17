import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'

export const Alumnos = () => {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Cargar alumnos al montar el componente
  useEffect(() => {
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    setLoading(true)
    setError(null)
    try {
      const q = query(collection(db, 'alumnos'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAlumnos(datos)
      console.log('✅ Alumnos cargados:', datos.length)
    } catch (err) {
      console.error('Error al cargar alumnos:', err)
      setError('Error al cargar alumnos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este alumno?')) {
      // pedir clave estática antes de eliminar
      const clave = window.prompt('Ingrese la clave de autorización para eliminar alumnos:')
      if (clave !== 'noq2025') {
        setError('Clave incorrecta. Operación cancelada.')
        return
      }

      try {
        await deleteDoc(doc(db, 'alumnos', id))
        setAlumnos(alumnos.filter(a => a.id !== id))
        console.log('✅ Alumno eliminado:', id)
      } catch (err) {
        console.error('Error al eliminar:', err)
        setError('Error al eliminar: ' + err.message)
      }
    }
  }

  const handleEditClick = (alumno) => {
    setEditingId(alumno.id)
    setEditForm(alumno)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSaveEdit = async () => {
    // pedir clave estática antes de actualizar
    const clave = window.prompt('Ingrese la clave de autorización para editar alumnos:')
    if (clave !== 'noq2025') {
      setError('Clave incorrecta. Operación cancelada.')
      return
    }

    try {
      const { id, createdAt, ...datos } = editForm
      await updateDoc(doc(db, 'alumnos', editingId), datos)
      setAlumnos(alumnos.map(a => a.id === editingId ? editForm : a))
      setEditingId(null)
      setEditForm({})
      console.log('✅ Alumno actualizado:', editingId)
    } catch (err) {
      console.error('Error al actualizar:', err)
      setError('Error al actualizar: ' + err.message)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  // Filtrar alumnos por búsqueda
  const alumnosFiltrados = alumnos.filter(a =>
    (a.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      a.apellido?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <main className="p-6 min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Gestión de Alumnos</h2>
        <button
          onClick={cargarAlumnos}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Recargar'}
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando alumnos...</div>
      ) : alumnosFiltrados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {alumnos.length === 0 ? 'No hay alumnos registrados' : 'No se encontraron resultados'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Apellido</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((alumno) => (
                <tr key={alumno.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                  {editingId === alumno.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          name="nombre"
                          value={editForm.nombre || ''}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="apellido"
                          value={editForm.apellido || ''}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="email"
                          value={editForm.email || ''}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="telefono"
                          value={editForm.telefono || ''}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name="curso"
                          value={editForm.curso || ''}
                          onChange={handleEditChange}
                          className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{alumno.nombre}</td>
                      <td className="px-4 py-3">{alumno.apellido}</td>
                      <td className="px-4 py-3">{alumno.email}</td>
                      <td className="px-4 py-3">{alumno.telefono || '-'}</td>
                      <td className="px-4 py-3">{alumno.curso || '-'}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => handleEditClick(alumno)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(alumno.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        Total de alumnos: {alumnosFiltrados.length} / {alumnos.length}
      </div>
    </main>
  )
}

export default Alumnos