import React from 'react';

export default function FolderIcon({ size = 56, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size * 0.85} 
      viewBox="0 0 100 85" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 6px 10px rgba(30, 58, 138, 0.22))' }}
    >
      <defs>
        <linearGradient id="folderBack" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id="folderOrange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="folderYellow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        <linearGradient id="paperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>

        <linearGradient id="folderFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="35%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        <filter id="paperShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.14" />
        </filter>
      </defs>

      <path d="M 10 18 Q 10 10 18 10 L 42 10 Q 47 10 50 15 L 53 20 L 90 20 Q 96 20 96 26 L 96 74 Q 96 80 90 80 L 10 80 Q 4 80 4 74 L 4 26 Q 4 18 10 18 Z" fill="url(#folderBack)" />
      <path d="M 14 11 L 40 11 Q 45 11 48 16 L 51 21 L 88 21" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.4" />

      <rect x="16" y="16" width="72" height="58" rx="6" fill="url(#folderOrange)" />
      <path d="M 16 22 Q 16 16 22 16 L 82 16 Q 88 16 88 22" fill="none" stroke="#fcd34d" strokeWidth="1" opacity="0.5" />

      <rect x="12" y="22" width="72" height="54" rx="6" fill="#78350f" opacity="0.25" />
      <rect x="12" y="21" width="72" height="54" rx="6" fill="url(#folderYellow)" />
      <path d="M 12 27 Q 12 21 18 21 L 78 21 Q 84 21 84 27" fill="none" stroke="#fef08a" strokeWidth="1.2" opacity="0.7" />

      <rect x="18" y="27" width="46" height="48" rx="4" fill="url(#paperGrad)" filter="url(#paperShadow)" />
      <rect x="24" y="33" width="20" height="2.5" rx="1.25" fill="#cbd5e1" />
      <rect x="24" y="39" width="30" height="2" rx="1" fill="#e2e8f0" />

      <rect x="21" y="36" width="45" height="40" rx="4" fill="url(#paperGrad)" filter="url(#paperShadow)" />
      <rect x="27" y="42" width="18" height="2.5" rx="1.25" fill="#cbd5e1" />
      <rect x="27" y="48" width="28" height="2" rx="1" fill="#e2e8f0" />

      <rect x="18" y="45" width="46" height="32" rx="4" fill="url(#paperGrad)" filter="url(#paperShadow)" />
      <rect x="24" y="51" width="22" height="2.5" rx="1.25" fill="#94a3b8" />
      <rect x="24" y="57" width="32" height="2" rx="1" fill="#cbd5e1" />
      <rect x="24" y="62" width="24" height="2" rx="1" fill="#e2e8f0" />

      <path d="M 4 39 Q 4 36 8 36 L 12 36 Q 18 36 20 46 Q 23 59 33 59 L 45 59 Q 55 59 58 46 Q 60 36 66 36 L 90 36 Q 96 36 96 42 L 96 74 Q 96 80 90 80 L 10 80 Q 4 80 4 74 Z" fill="#1e3a8a" opacity="0.35" />
      
      <path d="M 4 38 Q 4 34 8 34 L 12 34 Q 18 34 20 44 Q 23 57 33 57 L 45 57 Q 55 57 58 44 Q 60 34 66 34 L 90 34 Q 96 34 96 40 L 96 74 Q 96 80 90 80 L 10 80 Q 4 80 4 74 L 4 38 Z" fill="url(#folderFront)" />

      <path d="M 6 35 L 12 35 Q 18 35 20 45 Q 23 58 33 58 L 45 58 Q 55 58 58 45 Q 60 35 66 35 L 94 35" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

      <path d="M 50 80 L 90 80 Q 96 80 96 74 L 96 40 Q 96 34 90 34 L 70 34 Q 60 55 50 80 Z" fill="#ffffff" opacity="0.08" />
    </svg>
  );
}
