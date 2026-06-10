import { useState, useMemo } from 'react'
import { inventoryData as initialData } from '../../data/adminData'
import Badge from '../../components/ui/Badge'

const unidades = ['Tabletas', 'Cápsulas', 'Ampollas', 'Frascos', 'ml', 'mg', 'Unidades']

function getEstado(stock) {
  if (stock >= 100) return 'Disponible'
  if (stock >= 20) return 'Bajo stock'
  return 'Crítico'
}

function nextId(items) {
  const nums = items.map(i => parseInt(i.id.replace('MED-', ''), 10))
  const max = Math.max(...nums, 0)
  return `MED-${String(max + 1).padStart(3, '0')}`
}

export default function InventoryPage() {
  const [products, setProducts] = useState(initialData)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ nombre: '', concentracion: '', stock: '', precio: '', unidad: 'Tabletas', especificaciones: '', foto: '' })

  const filtered = useMemo(
    () => {
      if (!search.trim()) return products
      const q = search.toLowerCase()
      return products.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.nombre.toLowerCase().includes(q) ||
          p.concentracion.toLowerCase().includes(q)
      )
    },
    [products, search]
  )

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm({ ...form, foto: ev.target.result })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const stock = parseInt(form.stock, 10)
    const precio = parseInt(form.precio, 10)
    if (!form.nombre || isNaN(stock) || isNaN(precio)) return

    const newProduct = {
      id: nextId(products),
      nombre: form.nombre,
      concentracion: form.concentracion,
      stock,
      estado: getEstado(stock),
      precio,
      unidad: form.unidad,
      especificaciones: form.especificaciones,
      foto: form.foto,
    }
    setProducts([...products, newProduct])
    setForm({ nombre: '', concentracion: '', stock: '', precio: '', unidad: 'Tabletas', especificaciones: '', foto: '' })
    setShowModal(false)
  }

  return (
    <>
      <div className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6">
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
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              &times;
            </button>
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
                <th className="text-left pb-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 text-sm">
                    {search ? 'No se encontraron productos con ese criterio' : 'Sin productos en el inventario'}
                  </td>
                </tr>
              ) : (
                filtered.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="py-2 pr-3">
                      {item.foto ? (
                        <img src={item.foto} alt={item.nombre} className="w-10 h-10 object-cover rounded-lg border border-gray-200" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                      ) : null}
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 border border-gray-200 items-center justify-center text-xs font-bold text-sky-600 ${item.foto ? 'hidden' : 'flex'}`}>
                        Rx
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-blue-600 font-semibold">{item.id}</td>
                    <td className="py-3 pr-4 text-gray-800 font-medium">{item.nombre} {item.concentracion}</td>
                    <td className="py-3 pr-4 text-gray-800 font-semibold">{item.stock.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-gray-800 font-semibold">${item.precio.toLocaleString()}</td>
                    <td className="py-3"><Badge text={item.estado} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">Agregar Producto</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Nombre del producto</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Atorvastatina"
                  className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Concentracion</label>
                  <input
                    name="concentracion"
                    value={form.concentracion}
                    onChange={handleChange}
                    placeholder="Ej. 400mg, 500mg/5ml"
                    className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Forma farmaceutica</label>
                  <select
                    name="unidad"
                    value={form.unidad}
                    onChange={handleChange}
                    className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm appearance-none"
                  >
                    {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Stock</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Precio ($)</label>
                  <input
                    name="precio"
                    type="number"
                    min="0"
                    value={form.precio}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Especificaciones</label>
                <textarea
                  name="especificaciones"
                  value={form.especificaciones}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Indicaciones, contraindicaciones, via de administracion..."
                  className="w-full pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1 block">Foto del producto</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors">
                    <span className="text-base">+</span>
                    <span>{form.foto ? 'Cambiar imagen' : 'Agregar imagen'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    name="foto"
                    value={form.foto}
                    onChange={handleChange}
                    placeholder="o pega una URL..."
                    className="flex-1 pl-3 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
                  />
                </div>
                {form.foto && (
                  <div className="mt-3">
                    <img src={form.foto} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" onError={(e) => { e.target.style.display = 'none' }} />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm shadow-md hover:shadow-lg active:scale-[0.97]">
                  Agregar
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
