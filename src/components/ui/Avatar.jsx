import { useState } from 'react'

const API_URL = 'http://localhost:3000'

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-10 h-10 text-lg',
  xl: 'w-14 h-14 text-xl',
}

const roundedMap = {
  full: 'rounded-full',
  xl: 'rounded-xl',
  lg: 'rounded-lg',
  md: 'rounded-md',
}

export default function Avatar({ src, name, size = 'md', rounded = 'full', className = '' }) {
  const [imgError, setImgError] = useState(false)
  const hasImg = src && !imgError
  const initial = name?.charAt(0) || '?'

  return (
    <div className={`${sizeMap[size] || sizeMap.md} ${roundedMap[rounded] || roundedMap.full} bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden flex-shrink-0 ${className}`}>
      {hasImg ? (
        <img
          src={src.startsWith('http') ? src : API_URL + src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initial
      )}
    </div>
  )
}
