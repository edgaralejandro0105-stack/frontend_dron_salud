import { useEffect } from 'react'
import logo from '../../assets/Dron_Salud.png'

const css = `
@keyframes dfly {
  0% { transform: translate(-350px, -250px) scale(0.3) rotate(15deg); opacity: 0; }
  25% { transform: translate(0, -30px) scale(1) rotate(0deg); opacity: 1; }
  38% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  45% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  50% { transform: translate(0, -65px) scale(0.95) rotate(-3deg); opacity: 1; }
  70% { transform: translate(60px, -130px) scale(0.7) rotate(10deg); opacity: 0.8; }
  100% { transform: translate(350px, -280px) scale(0.3) rotate(15deg); opacity: 0; }
}
@keyframes cgone {
  0% { transform: translate(-350px, -210px) scale(0.3) rotate(15deg); opacity: 0; }
  25% { transform: translate(0, 10px) scale(1) rotate(0deg); opacity: 1; }
  38% { transform: translate(0, 40px) scale(1) rotate(0deg); opacity: 1; }
  43% { transform: translate(0, 40px) scale(1) rotate(0deg); opacity: 0; }
  100% { transform: translate(0, 40px) scale(1) rotate(0deg); opacity: 0; }
}
@keyframes ldrop {
  0%, 43% { opacity: 0; transform: scale(0.2); }
  48% { opacity: 1; transform: scale(1.15); }
  56% { transform: scale(0.9); }
  64% { transform: scale(1.05); }
  76%, 100% { opacity: 1; transform: scale(1); }
}
@keyframes rspin {
  0% { opacity: 0.2; }
  25% { opacity: 0.3; }
  50% { opacity: 0.15; }
  75% { opacity: 0.25; }
  100% { opacity: 0.2; }
}
.d-anim { animation: dfly 5s ease-in-out forwards; }
.c-anim { animation: cgone 5s ease-in-out forwards; }
.l-anim { animation: ldrop 5s ease-out forwards; }
.r-anim { animation: rspin 0.15s ease-in-out infinite; }
`

export default function DroneDelivery() {
  useEffect(() => {
    if (!document.getElementById('dd-css')) {
      const el = document.createElement('style')
      el.id = 'dd-css'
      el.textContent = css
      document.head.appendChild(el)
    }
  }, [])

  return (
    <div className="relative w-72 h-72 mx-auto">
      {/* Final logo - centered, grows after drone leaves */}
      <div className="l-anim absolute inset-0 flex items-center justify-center">
        <img src={logo} alt="Dron Salud" className="w-72 h-72 object-contain" />
      </div>

      {/* Carried logo - below drone, fades when placed */}
      <div className="c-anim absolute inset-0 flex items-center justify-center">
        <img src={logo} alt="" className="w-16 h-16 object-contain" />
      </div>

      {/* Drone - on top of everything */}
      <div className="d-anim absolute inset-0 flex items-center justify-center z-20">
        <svg width="225" height="130" viewBox="-30 0 235 130">
          {/* Arms */}
          <line x1="46" y1="40" x2="4" y2="22" stroke="#E5E7EB" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="114" y1="40" x2="156" y2="22" stroke="#E5E7EB" strokeWidth="4.5" strokeLinecap="round" />

          {/* Body - óvalo frontal */}
          <ellipse cx="80" cy="50" rx="38" ry="24" fill="#F9FAFB" />
          <ellipse cx="80" cy="50" rx="35" ry="21" fill="#F3F4F6" />

          {/* Battery hump */}
          <rect x="54" y="30" width="52" height="10" rx="5" fill="#E5E7EB" />

          {/* Vision sensors */}
          <circle cx="64" cy="46" r="3.5" fill="#1F2937" />
          <circle cx="96" cy="46" r="3.5" fill="#1F2937" />

          {/* Status LED */}
          <circle cx="80" cy="56" r="2.5" fill="#34D399" />

          {/* Vent line */}
          <line x1="56" y1="62" x2="104" y2="62" stroke="#E5E7EB" strokeWidth="1.5" />

          {/* Motors */}
          <circle cx="4" cy="22" r="9" fill="#374151" />
          <circle cx="156" cy="22" r="9" fill="#374151" />
          <circle cx="1" cy="19" r="3" fill="#6B7280" opacity="0.5" />
          <circle cx="153" cy="19" r="3" fill="#6B7280" opacity="0.5" />

          {/* Arm LEDs */}
          <circle cx="18" cy="28" r="2" fill="#EF4444" />
          <circle cx="142" cy="28" r="2" fill="#10B981" />

          {/* Rotors - centrados arriba de los motores */}
          <g className="r-anim">
            <ellipse cx="4" cy="12" rx="28" ry="7" fill="#93C5FD" opacity="0.25" />
            <line x1="-24" y1="12" x2="32" y2="12" stroke="#93C5FD" strokeWidth="2.5" opacity="0.5" />
            <circle cx="4" cy="12" r="3.5" fill="#D1D5DB" />
          </g>
          <g className="r-anim">
            <ellipse cx="156" cy="12" rx="28" ry="7" fill="#93C5FD" opacity="0.25" />
            <line x1="128" y1="12" x2="184" y2="12" stroke="#93C5FD" strokeWidth="2.5" opacity="0.5" />
            <circle cx="156" cy="12" r="3.5" fill="#D1D5DB" />
          </g>

          {/* Landing gear */}
          <line x1="56" y1="68" x2="50" y2="106" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          <line x1="104" y1="68" x2="110" y2="106" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="108" x2="118" y2="108" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
