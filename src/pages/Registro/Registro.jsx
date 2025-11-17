import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

export const Registro = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    curso: '',
    telefono: '',
    observaciones: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // validación simple
    if (!form.nombre || !form.apellido || !form.email) {
      setError('Nombre, apellido y email son obligatorios')
      return
    }

    // solicitar clave estática antes de continuar
    const clave = window.prompt('Ingrese la clave de autorización para registrar alumnos:')
    if (clave !== 'noq2025') {
      setError('Clave incorrecta. Operación cancelada.')
      return
    }

    setLoading(true)
    console.log('📝 Iniciando guardado de alumno...', form)
    console.log('🔥 Firebase DB:', db)

    try {
      console.log('📤 Enviando a Firestore...')
      
      // Timeout de 8 segundos
      const savePromise = addDoc(collection(db, 'alumnos'), {
        ...form,
        createdAt: serverTimestamp(),
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          console.error('⏱️ TIMEOUT alcanzado')
          reject(new Error('Timeout: la operación tardó demasiado. Verifica: 1) Las credenciales de Firebase, 2) Las reglas de Firestore, 3) Tu conexión a internet.'))
        }, 8000)
      )

      const docRef = await Promise.race([savePromise, timeoutPromise])
      console.log('✅ Guardado exitoso:', docRef.id)
      setSuccess('Alumno registrado correctamente (id: ' + docRef.id + ')')
      setForm({ nombre: '', apellido: '', email: '', curso: '', telefono: '', observaciones: '' })
    } catch (err) {
      console.error('❌ Error completo:', err)
      console.error('Código de error:', err.code)
      console.error('Mensaje:', err.message)
      
      // Mostrar error específico
      if (err.code === 'permission-denied') {
        setError('🚫 Permiso denegado. Las reglas de Firestore no permiten escribir. Verifica Firebase Console.')
      } else if (err.message?.includes('Timeout')) {
        setError(err.message)
      } else if (err.code === 'unavailable') {
        setError('⚠️ Firestore no está disponible. Verifica tu conexión.')
      } else {
        setError('Error: ' + (err.message || 'Desconocido'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-6 min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
      <h2 className="text-2xl text-blue-500 font-bold mb-4">Registrar Alumno — Aula Nider Orrego Quevedo</h2>

      <form onSubmit={handleSubmit} className="max-w-lg bg-white dark:bg-gray-800 p-6 rounded-lg border">
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Apellido" className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico" type="email" className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Teléfono" className="border rounded px-3 py-2 bg-white dark:bg-gray-900" />
        </div>

        <div className="mt-3">
          <input name="curso" value={form.curso} onChange={handleChange} placeholder="Curso / Aula" className="border rounded w-full px-3 py-2 bg-white dark:bg-gray-900" />
        </div>

        <div className="mt-3">
          <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows={4} placeholder="Observaciones" className="border rounded w-full px-3 py-2 bg-white dark:bg-gray-900" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded">
            {loading ? 'Guardando...' : 'Registrar alumno'}
          </button>
          <button type="button" onClick={() => setForm({ nombre: '', apellido: '', email: '', curso: '', telefono: '', observaciones: '' })} className="px-3 py-2 border rounded">Limpiar</button>
        </div>
      </form>
    </main>
  )
}
