export default function PharmacyProfileCard({ profile }) {
  return (
    <div className="space-y-2.5 text-sm">
      <div className="flex items-start gap-2.5">
        <span className="text-blue-300 mt-0.5">🏪</span>
        <div>
          <div className="font-bold text-white">{profile.nombre}</div>
          <div className="text-blue-200 text-xs">{profile.ciudad}</div>
        </div>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="text-blue-300 mt-0.5">📍</span>
        <span className="text-blue-100 text-xs leading-relaxed">{profile.direccion}</span>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="text-blue-300 mt-0.5">📞</span>
        <span className="text-blue-100 text-xs">{profile.telefono}</span>
      </div>
      <div className="flex items-start gap-2.5">
        <span className="text-blue-300 mt-0.5">✉️</span>
        <span className="text-blue-100 text-xs break-all">{profile.email}</span>
      </div>
    </div>
  )
}
