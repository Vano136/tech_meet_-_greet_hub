import React from "react";

interface LogoProps {
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: "drop-shadow(0px 0px 8px rgba(56, 189, 248, 0.4))",
        transition: "transform 0.3s ease",
      }}
    >
      <defs>
        {/* ფონის ფიგურის გრადიენტი */}
        <linearGradient
          id="logoBgGrad"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* შიდა ელემენტების გრადიენტი */}
        <linearGradient
          id="logoIconGrad"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>

      {/* ძირითადი ჰექსაგონი (Hexagon / ტექნოლოგიური ჩარჩო) */}
      <path
        d="M50 5 L88 27 V73 L50 95 L12 73 V27 Z"
        fill="url(#logoBgGrad)"
        rx="10"
      />

      {/* შიდა სქემატური ხაზები / ქსელი (Network / Hub) */}
      <path
        d="M50 25 V42 M32 60 L44 50 M68 60 L56 50"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* კოდის ფრჩხილები / შეხვედრის სიმბოლო (< >) */}
      <path
        d="M32 40 L22 50 L32 60"
        stroke="url(#logoIconGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M68 40 L78 50 L68 60"
        stroke="url(#logoIconGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ცენტრალური კვანძი (Hub / Connection Point) */}
      <circle cx="50" cy="50" r="7" fill="#ffffff" />
      <circle cx="50" cy="25" r="4" fill="#ffffff" />
      <circle cx="32" cy="60" r="4" fill="#ffffff" />
      <circle cx="68" cy="60" r="4" fill="#ffffff" />
    </svg>
  );
};