import { useState, useMemo } from 'react'
import { inventoryData, pharmacyProfiles } from '../../data/adminData'
import Badge from '../ui/Badge'
import LocationPicker from './LocationPicker'
import SupportButton from '../ui/SupportButton'
import logo from '../../assets/Dron_Salud.png'

function formatCurrency(n) {
  return '$' + n.toLocaleString()
}

const medicineEmojis = {
  'MED-001': '💊', 'MED-002': '💊', 'MED-003': '💉',
  'MED-004': '💊', 'MED-005': '💊', 'MED-006': '💊',
  'MED-007': '💊', 'MED-008': '💊', 'MED-009': '🫁',
  'MED-010': '💊',
}

function InvoiceModal({ cart, profile, onClose, onPlaceOrder }) {
  const cartTotal = cart.reduce((sum, item) => sum + item.product.precio * item.qty, 0)
  const cargoDron = 5000
  const iva = Math.round(cartTotal * 0.16)
  const total = cartTotal + cargoDron + iva

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Factura</h3>
            <p className="text-xs text-gray-500 mt-0.5">Detalle completo del pedido</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {profile && (
            <div className="flex items-center gap-4 bg-gradient-to-br from-sky-50/50 to-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                {profile.nombre.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-gray-800">{profile.nombre}</div>
                <div className="text-xs text-gray-500 mt-0.5">{profile.direccion}</div>
                <div className="text-xs text-gray-400 mt-0.5">{profile.telefono} · {profile.ciudad}</div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Productos</div>
            {cart.map((item, i) => (
              <div key={item.product.id} className="flex items-center gap-4 bg-gray-50/80 rounded-xl p-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {item.product.foto ? (
                    <img src={item.product.foto} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span>{medicineEmojis[item.product.id] || '💊'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800">{item.product.nombre} {item.product.concentracion}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.product.unidad} · {item.product.especificaciones?.substring(0, 40)}...</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-500">{item.qty} × {formatCurrency(item.product.precio)}</div>
                  <div className="text-sm font-bold text-gray-800 mt-0.5">{formatCurrency(item.product.precio * item.qty)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1.5">🚁 Cargo de envío (dron)</span>
              <span className="font-semibold text-gray-800">{formatCurrency(cargoDron)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">IVA 16%</span>
              <span className="font-semibold text-gray-800">{formatCurrency(iva)}</span>
            </div>
            <div className="flex items-center justify-between text-lg pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900 font-['Plus_Jakarta_Sans']">Total</span>
              <span className="font-bold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onPlaceOrder}
              className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl active:scale-[0.97]"
            >
              Confirmar Pedido
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Seguir editando
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({ cart, profile, deliveryLocation, onConfirm, onCancel }) {
  const cartTotal = cart.reduce((sum, item) => sum + item.product.precio * item.qty, 0)
  const cargoDron = 5000
  const iva = Math.round(cartTotal * 0.16)
  const granTotal = cartTotal + cargoDron + iva

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">&#10067;</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-2">Confirmar Pedido</h3>
          <p className="text-sm text-gray-500 mb-5">
            Estas seguro de realizar este pedido por <span className="font-bold text-gray-800">{formatCurrency(granTotal)}</span>?
          </p>

          {profile && (
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5 text-left">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {profile.nombre.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-800">{profile.nombre}</div>
                <div className="text-xs text-gray-500">{profile.direccion}</div>
              </div>
            </div>
          )}

          {deliveryLocation && (
            <div className="flex items-center gap-3 bg-sky-50 rounded-xl p-3 mb-5 text-left border border-sky-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm font-semibold text-gray-800">Direccion de entrega</div>
                <div className="text-xs text-gray-500 mt-0.5 truncate">{deliveryLocation.direccion || deliveryLocation.address}</div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-400 mb-6">
            Al confirmar, se enviara un dron con tu pedido a la direccion indicada.
          </div>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 active:scale-[0.97]"
            >
              Si, confirmar pedido
            </button>
            <button
              onClick={onCancel}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DroneInstructions({ cart, profile, deliveryLocation, onBackToShop }) {
  const cartTotal = cart.reduce((sum, item) => sum + item.product.precio * item.qty, 0)
  const cargoDron = 5000
  const iva = Math.round(cartTotal * 0.16)
  const granTotal = cartTotal + cargoDron + iva

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900" style={{ backgroundSize: '200% 200%' }}>
      <div className="w-full max-w-lg mx-4 text-center animate-fade-in">
        <div className="mb-6">
          <img src={logo} alt="Dron Salud" className="w-40 h-40 object-contain animate-float mx-auto" />
        </div>

        <h2 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-2">Pedido Confirmado</h2>
        <p className="text-sky-200 text-sm mb-8">Tu dron esta siendo preparado</p>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-left mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm">1</div>
              <div>
                <div className="text-sm font-bold text-white">Preparacion del pedido</div>
                <div className="text-xs text-sky-200 mt-0.5">La farmacia esta preparando tus productos. Tiempo estimado: 5-10 min.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm">2</div>
              <div>
                <div className="text-sm font-bold text-white">Despegue del dron</div>
                <div className="text-xs text-sky-200 mt-0.5">El dron despegara desde la farmacia hacia tu ubicacion.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm">3</div>
              <div>
                <div className="text-sm font-bold text-white">Alejate durante el descenso</div>
                <div className="text-xs text-sky-200 mt-0.5">Cuando el dron este descendiendo, manten una distancia de seguridad. No te acerques hasta que haya aterrizado por completo.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold text-sm">4</div>
              <div>
                <div className="text-sm font-bold text-white">Retira tus productos</div>
                <div className="text-xs text-sky-200 mt-0.5">Espera a que el dron apague sus motores por completo. Luego retira tus productos de forma segura.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/10 text-left mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white">Resumen del pedido</span>
            <span className="text-xs text-sky-300">{cart.reduce((s, i) => s + i.qty, 0)} producto{cart.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {cart.map((item, i) => (
              <div key={item.product.id} className="flex justify-between text-sky-100">
                <span>{item.product.nombre} {item.product.concentracion} x {item.qty}</span>
                <span className="font-semibold text-white">{formatCurrency(item.product.precio * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 flex justify-between text-sm">
            <span className="font-bold text-white">Total pagado</span>
            <span className="font-bold text-sky-300">{formatCurrency(granTotal)}</span>
          </div>
        </div>

        {profile && (
          <div className="text-xs text-sky-300 mb-2">
            Origen: {profile.nombre} &middot; {profile.direccion}
          </div>
        )}
        {deliveryLocation && (
          <div className="text-xs text-sky-300 mb-6">
            Destino: {deliveryLocation.direccion || deliveryLocation.address}
          </div>
        )}

        <button
          onClick={onBackToShop}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 active:scale-[0.97]"
        >
          Volver a la tienda
        </button>

        <SupportButton />
      </div>
    </div>
  )
}

export default function ShoppingModule({ user }) {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [cart, setCart] = useState([])
  const [showInvoice, setShowInvoice] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showDroneInstructions, setShowDroneInstructions] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('todos')

  const catalog = useMemo(
    () => (selectedPharmacy
      ? inventoryData.filter(p => p.farmaciaId === selectedPharmacy.id)
      : []),
    [selectedPharmacy]
  )

  const categorias = useMemo(() => {
    const cats = new Set(catalog.map(p => p.categoria).filter(Boolean))
    return ['todos', ...Array.from(cats).sort()]
  }, [catalog])

  const filteredCatalog = useMemo(() => {
    let items = catalog
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      items = items.filter(p =>
        p.nombre.toLowerCase().includes(q) ||
        p.concentracion.toLowerCase().includes(q) ||
        p.especificaciones.toLowerCase().includes(q)
      )
    }
    if (filterCategoria !== 'todos') {
      items = items.filter(p => p.categoria === filterCategoria)
    }
    return items
  }, [catalog, searchQuery, filterCategoria])

  const profile = selectedPharmacy
    ? pharmacyProfiles.find(p => p.id === selectedPharmacy.id)
    : null

  const cartTotal = cart.reduce((sum, item) => sum + item.product.precio * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const stockOk = (item) => item.estado !== 'Crítico'

  function addToCart(product, qty) {
    if (qty < 1) return
    setCart(prev => {
      const exist = prev.find(c => c.product.id === product.id)
      if (exist) {
        return prev.map(c =>
          c.product.id === product.id ? { ...c, qty: c.qty + qty } : c
        )
      }
      return [...prev, { product, qty }]
    })
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(c => c.product.id !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(c => (c.product.id === productId ? { ...c, qty } : c))
    )
  }

  function placeOrder() {
    setShowInvoice(false)
    setShowLocationPicker(true)
  }

  function handleLocationConfirm(location) {
    setDeliveryLocation(location)
    setShowLocationPicker(false)
    setShowConfirm(true)
  }

  function handleLocationBack() {
    setShowLocationPicker(false)
    setShowInvoice(true)
  }

  function confirmOrder() {
    setShowConfirm(false)
    setShowDroneInstructions(true)
  }

  function backToShop() {
    setShowDroneInstructions(false)
    setSelectedPharmacy(null)
    setCart([])
    setDeliveryLocation(null)
    setSearchQuery('')
    setFilterCategoria('todos')
  }

  // ─── Step 1: Pharmacy Selection ──────────────────────────────────
  if (!selectedPharmacy) {
    return (
      <div>
        <p className="text-sm text-gray-500 mb-6">Selecciona la farmacia donde deseas realizar tu pedido</p>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {pharmacyProfiles.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPharmacy(p)}
              className="card-hover bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 text-left hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-blue-500/20 mb-3 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-300">
                  {p.nombre.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-800">{p.nombre}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.ciudad}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs">📍</span>
                  <span>{p.direccion}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs">📞</span>
                  <span>{p.telefono}</span>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:text-blue-800 transition-colors text-center">
                Ver catálogo →
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ─── Step 2: Shopping (catalog + cart) ───────────────────────────
  return (
    <>
    <div className="flex gap-6">
      {/* Product Catalog */}
      <div className="flex-1 min-w-0">
        {/* Pharmacy bar */}
        <div className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center gap-3">
             <button onClick={() => { setSelectedPharmacy(null); setCart([]); setDeliveryLocation(null) }} className="text-gray-400 hover:text-gray-600 transition-colors text-lg mr-1">←</button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center text-blue-600 font-bold">
              {profile.nombre.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-800">{profile.nombre}</div>
              <div className="text-xs text-gray-500">{profile.direccion}, {profile.ciudad}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {filteredCatalog.length} de {catalog.length} producto{catalog.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar medicamento..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 transition-all duration-200 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategoria(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  filterCategoria === cat
                    ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {cat === 'todos' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-sm font-semibold">No se encontraron medicamentos</p>
            <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
          </div>
        ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredCatalog.map(product => {
            const inCart = cart.find(c => c.product.id === product.id)
            return (
              <ProductCard
                key={product.id}
                product={product}
                inCart={inCart}
                stockOk={stockOk(product)}
                onAdd={addToCart}
              />
            )
          })}
        </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-5 sticky top-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">🛒 Carrito</h3>
            {cartCount > 0 && (
              <span className="bg-gradient-to-r from-sky-600 to-blue-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          {showDroneInstructions ? (
            <div className="text-center py-10">
              <span className="text-4xl">&#9989;</span>
              <p className="text-sm font-bold text-gray-800 mt-3">Pedido realizado</p>
              <p className="text-xs text-gray-500 mt-1">Tu pedido esta en proceso</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <span className="text-3xl">🛒</span>
              <p className="text-xs mt-2 font-semibold">Carrito vacío</p>
              <p className="text-xs">Agrega productos del catálogo</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs font-bold text-gray-800 leading-tight pr-2">
                        {item.product.nombre} {item.product.concentracion}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors text-sm flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{item.product.unidad}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(item.product.id, item.qty - 1)}
                          className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.product.id, item.qty + 1)}
                          className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-xs font-bold text-gray-800">
                        {formatCurrency(item.product.precio * item.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-800">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Items</span>
                  <span>{cartCount} unidad{cartCount !== 1 ? 'es' : ''}</span>
                </div>
                <button
                  onClick={() => setShowInvoice(true)}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm mt-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.97]"
                >
                  Ver Compra 📄
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {showInvoice && (
      <InvoiceModal
        cart={cart}
        profile={profile}
        onClose={() => setShowInvoice(false)}
        onPlaceOrder={placeOrder}
      />
    )}

    {showLocationPicker && (
      <LocationPicker
        onConfirm={handleLocationConfirm}
        onBack={handleLocationBack}
        pharmacyLocation={profile ? { lat: profile.lat, lng: profile.lng } : null}
      />
    )}

    {showConfirm && (
      <ConfirmModal
        cart={cart}
        profile={profile}
        deliveryLocation={deliveryLocation}
        onConfirm={confirmOrder}
        onCancel={() => setShowConfirm(false)}
      />
    )}

    {showDroneInstructions && (
      <DroneInstructions
        cart={cart}
        profile={profile}
        deliveryLocation={deliveryLocation}
        onBackToShop={backToShop}
      />
    )}
    </>
  )
}

// ─── Product Card Component ────────────────────────────────────────
function ProductCard({ product, inCart, stockOk, onAdd }) {
  const [qty, setQty] = useState(1)

  return (
    <div className="card-hover bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-5 flex flex-col">
      {/* Photo or placeholder */}
      <div className="w-full h-36 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center mb-4 overflow-hidden">
        {product.foto ? (
          <img src={product.foto} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl opacity-40">💊</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-bold text-gray-800 leading-tight">
            {product.nombre} {product.concentracion}
          </h4>
          <Badge text={product.estado} />
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">{product.unidad}</span>
          <span className={`text-xs font-semibold ${product.stock > 100 ? 'text-green-600' : product.stock > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
            Stock: {product.stock.toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {product.especificaciones}
        </div>
        <div className="text-base font-bold gradient-text mb-3">
          {formatCurrency(product.precio)}
        </div>
      </div>

      {/* Add to cart */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-10 h-8 text-center text-sm font-bold text-gray-800 bg-transparent border-x border-gray-200 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            +
          </button>
        </div>
        <button
          onClick={() => { onAdd(product, qty); setQty(1) }}
          disabled={!stockOk}
          className={`flex-1 h-8 rounded-lg text-xs font-bold transition-colors ${
            inCart
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : stockOk
                ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg active:scale-[0.97]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!stockOk ? 'Sin stock' : inCart ? `✓ ${inCart.qty + qty} en carrito` : 'Agregar'}
        </button>
      </div>
    </div>
  )
}

