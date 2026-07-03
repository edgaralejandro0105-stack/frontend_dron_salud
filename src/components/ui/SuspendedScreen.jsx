import logo from '../../assets/Dron_Salud.png'

export default function SuspendedScreen({ message, onClose }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#081428] via-[#0c1f42] to-[#112a50] px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-red-600/5 to-rose-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-fade-in-up">
        <div className="mb-8">
            <img src={logo} alt="Dron Salud" className="w-40 h-40 object-contain mx-auto" />
        </div>

        <div className="w-24 h-24 rounded-full bg-red-500/20 border-4 border-red-500/40 flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(239,68,68,0.3)]">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 14v2M12 18h.01" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] mb-2">Cuenta Suspendida</h2>
        <p className="text-red-300/80 text-sm leading-relaxed mb-2">
          {message || 'Tu cuenta ha sido suspendida.'}
        </p>
        <p className="text-blue-200/40 text-xs leading-relaxed mb-8">
          Para más información o reactivar tu cuenta, comunícate con nuestro equipo de soporte.
        </p>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-200 hover:border-white/20 active:scale-[0.97] shadow-lg shadow-black/20 text-sm"
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  )
}
