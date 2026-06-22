import { useState, useMemo, useEffect } from 'react'
import { getProductos, createProducto, updateProducto, removeProducto } from '../../api'
import Badge from '../../components/ui/Badge'

const unidades = ['Tabletas', 'Cápsulas', 'Ampollas', 'Frascos', 'ml', 'mg', 'Unidades']

function getEstado(stock) {
  if (stock > 10) return 'Disponible'
  if (stock >= 6) return 'Bajo stock'
  return 'Crítico'
}

export default function InventoryPage({ user }) {
  const farmaciaId = user?.id_farmacia
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!farmaciaId) return
    getProductos({ id_farmacia: farmaciaId }).then(data => {
      if (Array.isArray(data)) setProducts(data)
      else if (data?.productos) setProducts(data.productos)
    }).catch(() => {})
  }, [farmaciaId])

  const emptyForm = { nombre: '', concentracion: '', stock_actual: '', precio: '', unidad_medida: 'Tabletas', especificaciones: '', foto_url: '', categoria: '' }
  const [form, setForm] = useState({ ...emptyForm })

  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(p =>
      String(p.id_producto).includes(q) ||
      p.nombre.toLowerCase().includes(q) ||
      (p.concentracion || '').toLowerCase().includes(q)
    )
  }, [products, search])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const stock = parseInt(form.stock_actual, 10)
    const precio = parseFloat(form.precio)
    if (!form.nombre || isNaN(stock) || isNaN(precio)) return

    const payload = {
      nombre: form.nombre,
      concentracion: form.concentracion,
      categoria: form.categoria,
      unidad_medida: form.unidad_medida,
      precio,
      stock_actual: stock,
      especificaciones: form.especificaciones,
      foto_url: form.foto_url,
    }

    try {
      if (editProduct) {
        await updateProducto(editProduct.id_producto, payload)
        setProducts(prev => prev.map(p => p.id_producto === editProduct.id_producto ? { ...p, ...payload } : p))
      } else {
        payload.id_farmacia = farmaciaId
        const created = await createProducto(payload)
        setProducts(prev => [...prev, created])
      }
      setForm({ ...emptyForm })
      setEditProduct(null)
      setShowModal(false)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al guardar')
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setForm({
      nombre: product.nombre,
      concentracion: product.concentracion || '',
      stock_actual: String(product.stock_actual),
      precio: String(product.precio),
      unidad_medida: product.unidad_medida || 'Tabletas',
      especificaciones: product.especificaciones || '',
      foto_url: product.foto_url || '',
      categoria: product.categoria || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      await removeProducto(id)
      setProducts(prev => prev.filter(p => p.id_producto !== id))
      setConfirmDelete(null)
    } catch (err) {
      alert(err?.response?.data?.message || err?.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <>
      <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
        <LowStockAlert products={products} />

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">Inventario de Medicamentos</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.97]"
          >
            + Agregar Producto
          </button>
        </div>

        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por codigo, nombre o concentracion..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                <th className="text-left pb-3 pr-3 w-12"></th>
                <th className="text-left pb-3 pr-4">Codigo</th>
                <th className="text-left pb-3 pr-4">Producto</th>
                <th className="text-left pb-3 pr-4">Stock</th>
                <th className="text-left pb-3 pr-4">Precio</th>
                <th className="text-left pb-3 pr-4">Estado</th>
                <th className="text-left pb-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">
                    {search ? 'No se encontraron productos con ese criterio' : 'Sin productos en el inventario'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => {
                  const estado = getEstado(item.stock_actual)
                  const isLow = estado === 'Bajo stock'
                  const isCrit = estado === 'Crítico'
                  return (
                    <tr key={item.id_producto} className={`border-b border-gray-50 transition-colors animate-fade-in ${
                      isCrit ? 'bg-red-50/60 hover:bg-red-100/60' : isLow ? 'bg-amber-50/60 hover:bg-amber-100/60' : 'hover:bg-blue-50/30'
                    }`} style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="py-2 pr-3">
                        {item.foto_url ? (
                          <img src={item.foto_url} alt={item.nombre} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-sky-600">Rx</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-blue-600 font-semibold">{item.id_producto}</td>
                      <td className="py-3 pr-4 text-gray-800 font-medium">{item.nombre} {item.concentracion}</td>
                      <td className={`py-3 pr-4 font-bold ${isCrit ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-800'}`}>{item.stock_actual}</td>
                      <td className="py-3 pr-4 text-gray-800 font-semibold">{formatCurrency(item.precio)}</td>
                      <td className="py-3"><Badge text={estado} /></td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setConfirmDelete(item.id_producto)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">{editProduct ? 'Editar Producto' : 'Agregar Producto'}</h3>
              <button onClick={() => { setShowModal(false); setEditProduct(null); setForm({ ...emptyForm }) }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Nombre del producto</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej. Atorvastatina" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Concentracion</label>
                  <input name="concentracion" value={form.concentracion} onChange={handleChange} placeholder="Ej. 400mg" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Categoria</label>
                  <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ej. Analgesicos" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Forma farmaceutica</label>
                  <select name="unidad_medida" value={form.unidad_medida} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                    {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Stock</label>
                  <input name="stock_actual" type="number" min="0" value={form.stock_actual} onChange={handleChange} placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Precio (Bs.)</label>
                  <input name="precio" type="number" step="0.01" min="0" value={form.precio} onChange={handleChange} placeholder="0" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" required />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Especificaciones</label>
                <textarea name="especificaciones" value={form.especificaciones} onChange={handleChange} rows="3" placeholder="Indicaciones, contraindicaciones..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Foto URL</label>
                <input name="foto_url" value={form.foto_url} onChange={handleChange} placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md">
                  {editProduct ? 'Guardar Cambios' : 'Agregar'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setEditProduct(null); setForm({ ...emptyForm }) }} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-800 text-sm font-semibold text-center mb-6">¿Eliminar este producto del inventario?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function LowStockAlert({ products }) {
  const bajos = products.filter(p => getEstado(p.stock_actual) === 'Bajo stock')
  const criticos = products.filter(p => getEstado(p.stock_actual) === 'Crítico')
  const total = bajos.length + criticos.length
  if (total === 0) return null

  return (
    <div className="mb-5 space-y-2 animate-fade-in">
      {criticos.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="text-sm text-red-800 font-semibold">
            <strong className="text-red-700">{criticos.length} producto{criticos.length !== 1 ? 's' : ''}</strong> en estado <strong>Crítico</strong>
            <span className="font-normal text-red-600 block text-xs mt-0.5">Requiere reposición inmediata</span>
          </div>
        </div>
      )}
      {bajos.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-amber-800 font-semibold">
            <strong className="text-amber-700">{bajos.length} producto{bajos.length !== 1 ? 's' : ''}</strong> con <strong>Stock Bajo</strong>
            <span className="font-normal text-amber-600 block text-xs mt-0.5">Considera realizar un nuevo pedido</span>
          </div>
        </div>
      )}
    </div>
  )
}

function formatCurrency(n) {
  const num = Number(n)
  if (isNaN(num)) return 'Bs. 0,00'
  return 'Bs. ' + num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
