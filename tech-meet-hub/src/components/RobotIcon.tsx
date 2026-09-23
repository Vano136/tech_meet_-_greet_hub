import React from "react";

interface RobotIconProps {
  size?: number;
}

export const RobotIcon: React.FC<RobotIconProps> = ({ size = 28 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0 2px 6px rgba(56, 189, 248, 0.45))",
        flexShrink: 0,
      }}
    >
      <defs>
        <linearGradient id="aiAntennaGrad" x1="50" y1="6" x2="50" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f43f5e" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>

        <linearGradient id="aiHeadBorderGrad" x1="20" y1="20" x2="80" y2="65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>

        <linearGradient id="aiScreenGrad" x1="26" y1="26" x2="74" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#090d16" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="aiBodyGrad" x1="32" y1="68" x2="68" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>

        <linearGradient id="aiEarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#64748b" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* ანტენა */}
      <rect x="47.5" y="15" width="5" height="10" rx="2.5" fill="#94a3b8" />
      <circle cx="50" cy="11" r="6" fill="url(#aiAntennaGrad)" />
      <circle cx="48" cy="9" r="2" fill="#ffe4e6" opacity="0.8" />

      {/* ყურები */}
      <rect x="12" y="34" width="7" height="16" rx="3.5" fill="url(#aiEarGrad)" />
      <rect x="81" y="34" width="7" height="16" rx="3.5" fill="url(#aiEarGrad)" />

      {/* თავის კორპუსი */}
      <rect x="18" y="22" width="64" height="42" rx="14" fill="url(#aiHeadBorderGrad)" />
      
      {/* ეკრანი */}
      <rect x="25" y="27" width="50" height="32" rx="9" fill="url(#aiScreenGrad)" stroke="#1e293b" strokeWidth="1.5" />

      {/* თვალები */}
      <circle cx="39" cy="40" r="5.5" fill="#38bdf8" />
      <circle cx="37.5" cy="38" r="1.8" fill="#ffffff" />
      <circle cx="61" cy="40" r="5.5" fill="#38bdf8" />
      <circle cx="59.5" cy="38" r="1.8" fill="#ffffff" />

      {/* ღაწვები */}
      <circle cx="32" cy="48" r="3" fill="#f43f5e" opacity="0.8" />
      <circle cx="68" cy="48" r="3" fill="#f43f5e" opacity="0.8" />

      {/* ღიმილი */}
      <path d="M44 48C47 52 53 52 56 48" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" />

      {/* ყელი */}
      <rect x="45" y="64" width="10" height="4" rx="2" fill="#64748b" />

      {/* სხეული */}
      <rect x="32" y="68" width="36" height="24" rx="9" fill="url(#aiBodyGrad)" stroke="#818cf8" strokeWidth="1.2" />

      {/* ბირთვი */}
      <circle cx="50" cy="80" r="4.5" fill="#38bdf8" />
      <circle cx="50" cy="80" r="2" fill="#ffffff" />
    </svg>
  );
};