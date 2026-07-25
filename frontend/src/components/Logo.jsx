export function LogoIcon({ size = 18, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern geometric Strategos S-Mark with analytical nodes */}
      <path 
        d="M6 8C6 6.34315 7.34315 5 9 5H17C18.6569 5 20 6.34315 20 8V9C20 10.6569 18.6569 12 17 12H7C5.34315 12 4 13.3431 4 15V16C4 17.6569 5.34315 19 7 19H15C16.6569 19 18 17.6569 18 16" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
      />
      <circle cx="17" cy="8.5" r="1.5" fill="#2563EB" />
      <circle cx="7" cy="15.5" r="1.5" fill="#2563EB" />
    </svg>
  )
}

export function LogoMark({ size = "w-7 h-7", iconSize = 16, className = "" }) {
  return (
    <div className={`${size} bg-[#0F172A] text-white rounded-md flex items-center justify-center shrink-0 shadow-xs ${className}`}>
      <LogoIcon size={iconSize} />
    </div>
  )
}

export default function Logo({ size = "normal", showBadge = true }) {
  const isSmall = size === "small"
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={isSmall ? "w-6 h-6" : "w-7 h-7"} iconSize={isSmall ? 14 : 16} />
      <div className="flex items-center gap-2">
        <span className={`font-extrabold tracking-tight text-[#0F172A] ${isSmall ? 'text-xs' : 'text-sm'}`}>
          STRATEGOS
        </span>
        {showBadge && (
          <span className="text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            Studio
          </span>
        )}
      </div>
    </div>
  )
}
