export default function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-200 group ${
        active
          ? 'bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-white shadow-sm border border-white/5'
          : 'text-blue-200/50 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className={`text-base ${active ? '' : 'opacity-60 group-hover:opacity-100'} transition-opacity`}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-blue-500" />
      )}
    </button>
  )
}
