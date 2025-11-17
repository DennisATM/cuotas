import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export const Pagos = () => {
  const [alumnos, setAlumnos] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // formulario
  const [form, setForm] = useState({ alumnoId: '', fecha: '', monto: '', meses: [] })
  const [saving, setSaving] = useState(false)

  // edición
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    cargarAlumnos()
    cargarPagos()
  }, [])

  const cargarAlumnos = async () => {
    try {
      const snap = await getDocs(collection(db, 'alumnos'))
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAlumnos(data)
    } catch (err) {
      console.error('Error cargando alumnos:', err)
      setError('Error cargando alumnos: ' + err.message)
    }
  }

  const cargarPagos = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'pagos'), orderBy('createdAt','desc'))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setPayments(data)
    } catch (err) {
      console.error('Error cargando pagos:', err)
      setError('Error cargando pagos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const toggleMes = (mes) => {
    setForm(f => ({ ...f, meses: f.meses.includes(mes) ? f.meses.filter(m => m !== mes) : [...f.meses, mes] }))
  }

  const validarForm = () => {
    if (!form.alumnoId) return 'Selecciona un alumno'
    if (!form.fecha) return 'Selecciona la fecha del pago'
    if (!form.monto || isNaN(Number(form.monto))) return 'Ingresa un monto válido'
    if (!form.meses || form.meses.length === 0) return 'Selecciona al menos un mes pagado'
    return null
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError(null)
    const v = validarForm()
    if (v) {
      setError(v)
      return
    }

    // autorización por clave estática
    const clave = window.prompt('Ingrese la clave de autorización para registrar/editar pagos:')
    if (clave !== 'noq2025') {
      setError('Clave de autorización incorrecta')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        // actualizar
        const { id, ...payload } = { ...form }
        await updateDoc(doc(db, 'pagos', editingId), {
          alumnoId: form.alumnoId,
          fecha: form.fecha,
          monto: Number(form.monto),
          meses: form.meses,
          updatedAt: serverTimestamp(),
        })
      } else {
        await addDoc(collection(db, 'pagos'), {
          alumnoId: form.alumnoId,
          fecha: form.fecha,
          monto: Number(form.monto),
          meses: form.meses,
          createdAt: serverTimestamp(),
        })
      }
      await cargarPagos()
      setForm({ alumnoId: '', fecha: '', monto: '', meses: [] })
      setEditingId(null)
    } catch (err) {
      console.error('Error guardando pago:', err)
      setError('Error guardando pago: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (pago) => {
    // pedir autorización antes de permitir editar
    const clave = window.prompt('Ingrese la clave de autorización para editar pagos:')
    if (clave !== 'noq2025') {
      setError('Clave de autorización incorrecta')
      return
    }
    setError(null)
    setEditingId(pago.id)
    setForm({ alumnoId: pago.alumnoId, fecha: pago.fecha, monto: pago.monto, meses: pago.meses || [] })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este pago?')) return
    const clave = window.prompt('Ingrese la clave de autorización para eliminar pagos:')
    if (clave !== 'noq2025') {
      setError('Clave de autorización incorrecta')
      return
    }
    try {
      await deleteDoc(doc(db, 'pagos', id))
      setPayments(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error eliminando pago:', err)
      setError('Error eliminando pago: ' + err.message)
    }
  }

  const lookupAlumno = (id) => alumnos.find(a => a.id === id)

  return (
    <main className="p-6 min-h-screen bg-background-light dark:bg-background-dark text-gray-800 dark:text-gray-200">
      <h2 className="text-2xl font-bold mb-4">Gestión de Pagos</h2>

      <section className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg border">
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Alumno</label>
            <select name="alumnoId" value={form.alumnoId} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900">
              <option value="">-- Selecciona alumno --</option>
              {alumnos.map(a => (
                <option key={a.id} value={a.id}>{a.nombre} {a.apellido} — {a.curso || '-'}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Fecha de pago</label>
            <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Monto (€)</label>
            <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900" />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Meses pagados (selecciona 1 o más)</label>
            <div className="grid grid-cols-3 gap-1 mt-2">
              {MONTHS.map(m => (
                <label key={m} className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.meses.includes(m)} onChange={() => toggleMes(m)} />
                  <span className="text-xs">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" disabled={saving} className="bg-primary text-white px-4 py-2 rounded">{editingId ? 'Actualizar pago' : 'Registrar pago'}</button>
            <button type="button" onClick={() => { setForm({ alumnoId: '', fecha: '', monto: '', meses: [] }); setEditingId(null); setError(null) }} className="px-3 py-2 border rounded">Limpiar</button>
          </div>
        </form>
      </section>

      <section>
        {loading ? (
          <div>Cargando pagos...</div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3">Alumno</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Meses</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => {
                  const alumno = lookupAlumno(p.alumnoId)
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">{alumno ? `${alumno.nombre} ${alumno.apellido}` : p.alumnoId}</td>
                      <td className="px-4 py-3">{p.fecha}</td>
                      <td className="px-4 py-3">{(p.meses || []).join(', ')}</td>
                      <td className="px-4 py-3">$ {Number(p.monto).toFixed(0)}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button onClick={() => handleEdit(p)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">Editar</button>
                        <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

export default Pagos
