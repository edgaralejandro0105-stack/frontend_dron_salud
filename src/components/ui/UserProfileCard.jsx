export default function UserProfileCard({ profile }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pb-2 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          {profile?.nombre?.charAt(0) || 'U'}
        </div>
        <div>
          <div className="text-sm font-bold text-white">{profile?.nombre || 'Usuario'}</div>
          <div className="text-xs text-blue-200/60">{profile?.rol || ''}</div>
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold text-blue-200/40 uppercase tracking-widest mb-1">Email</div>
        <div className="text-xs text-blue-200/70 font-medium break-all leading-tight">{profile?.email || '—'}</div>
      </div>
      <div>
        <div className="text-[10px] font-semibold text-blue-200/40 uppercase tracking-widest mb-1">Teléfono</div>
        <div className="text-xs text-white font-semibold">{profile?.telefono || '—'}</div>
      </div>
    </div>
  )
}
