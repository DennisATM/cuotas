import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'

export const Dashboard = () => {
    const [alumnos, setAlumnos] = useState([])
    const [pagos, setPagos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [selectedAlumno, setSelectedAlumno] = useState(null)
    const [selectedPagos, setSelectedPagos] = useState([])

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setLoading(true)
        try {
            const alumnosSnap = await getDocs(collection(db, 'alumnos'))
            const alumnosData = alumnosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            setAlumnos(alumnosData)

            const pagosSnap = await getDocs(query(collection(db, 'pagos'), orderBy('createdAt', 'desc')))
            const pagosData = pagosSnap.docs.map(d => ({ id: d.id, ...d.data() }))
            setPagos(pagosData)
        } catch (err) {
            console.error('Error cargando datos en Dashboard:', err)
            setError('Error cargando datos: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (v) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v || 0)
    }

    const totalRecaudado = pagos.reduce((s, p) => s + (Number(p.monto ?? p.importe ?? 0) || 0), 0)

    const ingresosDelMes = (() => {
        const now = new Date()
        const mm = now.getMonth() + 1
        const yy = now.getFullYear()
        return pagos.reduce((s, p) => {
            const fecha = p.fecha
            if (!fecha) return s
            const [y, m] = fecha.split('-').map(Number)
            if (y === yy && m === mm) return s + (Number(p.monto ?? p.importe ?? 0) || 0)
            return s
        }, 0)
    })()

    const alumnosSinPagos = alumnos.filter(a => !pagos.some(p => p.alumnoId === a.id)).length

    const verPagosAlumno = async (alumno) => {
        setSelectedAlumno(alumno)
        setSelectedPagos([])
        // primero intentar con los pagos ya cargados en memoria
        const local = pagos.filter(p => p.alumnoId === alumno.id)
        if (local.length > 0) {
            setSelectedPagos(local)
            return
        }
        // si no hay resultados locales, intentar consultar Firestore (fallback)
        try {
            const q = query(collection(db, 'pagos'), where('alumnoId', '==', alumno.id), orderBy('createdAt', 'desc'))
            const snap = await getDocs(q)
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setSelectedPagos(data)
        } catch (err) {
            console.error('Error cargando pagos por alumno:', err)
            setError('Error cargando pagos por alumno: ' + err.message)
        }
    }

    const cerrarModal = () => {
        setSelectedAlumno(null)
        setSelectedPagos([])
    }

    const saldoAcumulado = (alumnoId) => {
        const lista = pagos.filter(p => p.alumnoId === alumnoId)
        return lista.reduce((s, p) => s + (Number(p.monto ?? p.importe ?? 0) || 0), 0)
    }

    return (
        <main className="bg-background-light font-display p-4">
            <header className="flex justify-between mb-6">
                <h1 className="text-2xl md:text-3xl text-blue-500 font-bold">5° B - Nider Orrego Quevedo</h1>
                <div className="flex items-center gap-1">
                    <select className="rounded-md border py-2 px-3 bg-white">
                        <option>2025</option>
                        <option>2026</option>
                    </select>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-400 rounded-lg shadow">
                    <p className="text-sm text-white text-shadow">Total Recaudado</p>
                    <p className="text-2xl text-amber-300 text-shadow-xs font-bold">{formatCurrency(totalRecaudado)}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-500">Ingresos del mes</p>
                    <p className="text-2xl font-bold">{formatCurrency(ingresosDelMes)}</p>
                </div>

                <div className="p-4 bg-gray-400 rounded-lg shadow ">
                    <p className="text-sm text-white text-shadow">Alumnos sin pagos</p>
                    <p className="text-2xl font-bold text-amber-500 text-shadow-xs">{alumnosSinPagos}</p>
                </div>
            </section>

            <section className="mb-6">
                <h3 className="font-semibold mb-4">Listado de Alumnos</h3>
                {loading ? (
                    <div>Cargando alumnos...</div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg border">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-sm text-gray-500">
                                    <th className="py-2 px-4">Alumno</th>
                                    <th className="py-2 px-4">Curso</th>
                                    <th className="py-2 px-4">Teléfono</th>
                                    <th className="py-2 px-4">Saldo acumulado</th>
                                    <th className="py-2 px-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alumnos.map(a => (
                                    <tr key={a.id} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4">{a.nombre} {a.apellido}</td>
                                        <td className="py-3 px-4">{a.curso || '-'}</td>
                                        <td className="py-3 px-4">{a.telefono || '-'}</td>
                                        <td className="py-3 px-4">{formatCurrency(saldoAcumulado(a.id))}</td>
                                        <td className="py-3 px-4">
                                            <button onClick={() => verPagosAlumno(a)} className="px-3 py-1 bg-emerald-700 hover:bg-emerald-500 text-amber-400 rounded text-sm">Ver Pagos</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Modal de pagos por alumno */}
            {selectedAlumno && (
                <div className="fixed inset-0 bg-gray-600 flex items-center justify-center z-50">
                    <div className="bg-gray-100 dark:bg-gray-600 rounded-lg w-11/12 md:w-3/4 max-h-[80vh] overflow-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold">Pagos de {selectedAlumno.nombre} {selectedAlumno.apellido}</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Saldo acumulado: <strong>{formatCurrency(saldoAcumulado(selectedAlumno.id))}</strong></span>
                                <button onClick={cerrarModal} className="px-3 py-1 border bg-emerald-700 rounded">Cerrar</button>
                            </div>
                        </div>
                        <div>
                            {selectedPagos.length === 0 ? (
                                <div className="text-sm text-gray-500">No hay pagos registrados para este alumno.</div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-gray-500">
                                            <th className="py-2 px-3">Fecha</th>
                                            <th className="py-2 px-3">Meses</th>
                                            <th className="py-2 px-3">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPagos.map(p => (
                                            <tr key={p.id} className="border-t hover:bg-gray-50">
                                                <td className="py-2 px-3">{p.fecha}</td>
                                                <td className="py-2 px-3">{(p.meses || []).join(', ')}</td>
                                                <td className="py-2 px-3">{formatCurrency(p.monto ?? p.importe)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
