// src/components/CharacterPortrait.jsx
// 혼밥메이트 AI 캐릭터 SVG 일러스트

export default function CharacterPortrait({ id, size = 110 }) {
  const scale = size / 110;
  const h = Math.round(148 * scale);

  const portraits = {
    jisu: (
      <svg width={size} height={h} viewBox="0 0 110 148">
        <path d="M16,82 Q18,40 55,38 Q92,40 94,82 L92,100 Q75,112 55,112 Q35,112 18,100 Z" fill="#2A1A0E"/>
        <circle cx="55" cy="83" r="31" fill="#FDDBC9"/>
        <path d="M24,70 Q35,50 55,52 Q75,50 86,70 Q74,64 55,66 Q36,64 24,70 Z" fill="#2A1A0E"/>
        <ellipse cx="24" cy="83" rx="5" ry="7" fill="#FDDBC9"/>
        <ellipse cx="86" cy="83" rx="5" ry="7" fill="#FDDBC9"/>
        <ellipse cx="46" cy="79" rx="5" ry="6" fill="#1A0A08"/>
        <ellipse cx="64" cy="79" rx="5" ry="6" fill="#1A0A08"/>
        <circle cx="48" cy="77" r="2" fill="white"/>
        <circle cx="66" cy="77" r="2" fill="white"/>
        <path d="M39,70 Q46,67 53,70" stroke="#1A0A08" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M57,70 Q64,67 71,70" stroke="#1A0A08" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M53,87 Q55,90 57,87" stroke="#D4907A" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M44,98 Q55,109 66,98" stroke="#C04040" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M46,98 Q55,105 64,98 L64,99 Q55,108 46,99 Z" fill="white"/>
        <ellipse cx="38" cy="91" rx="8" ry="5" fill="#FFB4A0" opacity="0.45"/>
        <ellipse cx="72" cy="91" rx="8" ry="5" fill="#FFB4A0" opacity="0.45"/>
        <text x="18" y="93" fontSize="8" fill="#D85A30">✦</text>
        <rect x="50" y="111" width="10" height="12" rx="5" fill="#FDDBC9"/>
        <path d="M22,148 Q37,128 55,132 Q73,128 88,148 Z" fill="#D85A30"/>
        <path d="M47,132 L55,144 L63,132" fill="#F0997B"/>
      </svg>
    ),
    minjun: (
      <svg width={size} height={h} viewBox="0 0 110 148">
        <path d="M22,78 Q24,40 55,38 Q86,40 88,78 Q80,66 55,68 Q30,66 22,78 Z" fill="#0A0808"/>
        <rect x="17" y="68" width="11" height="22" rx="5" fill="#0A0808"/>
        <rect x="82" y="68" width="11" height="22" rx="5" fill="#0A0808"/>
        <circle cx="55" cy="83" r="31" fill="#D4956A"/>
        <ellipse cx="24" cy="83" rx="5" ry="7" fill="#D4956A"/>
        <ellipse cx="86" cy="83" rx="5" ry="7" fill="#D4956A"/>
        <ellipse cx="46" cy="79" rx="5" ry="5.5" fill="#0A0808"/>
        <ellipse cx="64" cy="79" rx="5" ry="5.5" fill="#0A0808"/>
        <circle cx="48" cy="77" r="1.8" fill="white"/>
        <circle cx="66" cy="77" r="1.8" fill="white"/>
        <path d="M39,70 Q46,68 53,70" stroke="#0A0808" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M57,70 Q64,68 71,70" stroke="#0A0808" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52,87 Q55,91 58,87" stroke="#A06040" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M46,97 Q55,104 64,97" stroke="#804030" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <rect x="50" y="111" width="10" height="12" rx="5" fill="#D4956A"/>
        <path d="M18,148 Q35,126 55,130 Q75,126 92,148 Z" fill="white"/>
        <path d="M18,148 Q35,126 40,130" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
        <path d="M92,148 Q75,126 70,130" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
        <path d="M47,130 L55,146 L63,130" fill="#1D9E75" opacity="0.25"/>
        <path d="M38,135 Q55,138 72,135" stroke="#1D9E75" strokeWidth="1" fill="none"/>
      </svg>
    ),
    soyeon: (
      <svg width={size} height={h} viewBox="0 0 110 148">
        <ellipse cx="55" cy="50" rx="38" ry="30" fill="#4A3020"/>
        <rect x="16" y="72" width="14" height="55" rx="7" fill="#4A3020"/>
        <rect x="80" y="72" width="14" height="55" rx="7" fill="#4A3020"/>
        <circle cx="55" cy="83" r="31" fill="#FDDBC9"/>
        <ellipse cx="55" cy="50" rx="36" ry="22" fill="#4A3020"/>
        <ellipse cx="24" cy="83" rx="5" ry="7" fill="#FDDBC9"/>
        <ellipse cx="86" cy="83" rx="5" ry="7" fill="#FDDBC9"/>
        <ellipse cx="46" cy="79" rx="5" ry="5.5" fill="#1A0A08"/>
        <ellipse cx="64" cy="79" rx="5" ry="5.5" fill="#1A0A08"/>
        <circle cx="48" cy="77" r="1.8" fill="white"/>
        <circle cx="66" cy="77" r="1.8" fill="white"/>
        <circle cx="46" cy="79" r="10" fill="none" stroke="#7F77DD" strokeWidth="1.8" opacity="0.85"/>
        <circle cx="64" cy="79" r="10" fill="none" stroke="#7F77DD" strokeWidth="1.8" opacity="0.85"/>
        <line x1="56" y1="79" x2="54" y2="79" stroke="#7F77DD" strokeWidth="1.8"/>
        <line x1="36" y1="76" x2="30" y2="74" stroke="#7F77DD" strokeWidth="1.8"/>
        <line x1="74" y1="76" x2="80" y2="74" stroke="#7F77DD" strokeWidth="1.8"/>
        <path d="M38,68 Q46,65 54,68" stroke="#4A3020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M56,68 Q64,65 72,68" stroke="#4A3020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M53,87 Q55,90 57,87" stroke="#D4907A" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M45,97 Q55,106 65,97" stroke="#C04040" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <ellipse cx="38" cy="91" rx="7" ry="4" fill="#FFB4A0" opacity="0.35"/>
        <ellipse cx="72" cy="91" rx="7" ry="4" fill="#FFB4A0" opacity="0.35"/>
        <rect x="50" y="111" width="10" height="12" rx="5" fill="#FDDBC9"/>
        <path d="M22,148 Q38,128 55,132 Q72,128 88,148 Z" fill="#7F77DD"/>
        <path d="M47,132 L55,145 L63,132" fill="#AFA9EC"/>
      </svg>
    ),
    hyunwoo: (
      <svg width={size} height={h} viewBox="0 0 110 148">
        <circle cx="55" cy="50" r="30" fill="#1A1208"/>
        <ellipse cx="30" cy="42" rx="9" ry="14" fill="#1A1208" transform="rotate(-25 30 42)"/>
        <ellipse cx="43" cy="30" rx="7" ry="13" fill="#1A1208" transform="rotate(-12 43 30)"/>
        <ellipse cx="55" cy="28" rx="8" ry="14" fill="#1A1208"/>
        <ellipse cx="67" cy="30" rx="7" ry="13" fill="#1A1208" transform="rotate(12 67 30)"/>
        <ellipse cx="80" cy="42" rx="9" ry="14" fill="#1A1208" transform="rotate(25 80 42)"/>
        <rect x="17" y="64" width="13" height="24" rx="6" fill="#1A1208"/>
        <rect x="80" y="64" width="13" height="24" rx="6" fill="#1A1208"/>
        <circle cx="55" cy="83" r="31" fill="#F0C07A"/>
        <ellipse cx="24" cy="83" rx="5" ry="7" fill="#F0C07A"/>
        <ellipse cx="86" cy="83" rx="5" ry="7" fill="#F0C07A"/>
        <ellipse cx="45" cy="78" rx="6" ry="7" fill="#1A0A08"/>
        <ellipse cx="65" cy="78" rx="6" ry="7" fill="#1A0A08"/>
        <circle cx="47" cy="76" r="2.2" fill="white"/>
        <circle cx="67" cy="76" r="2.2" fill="white"/>
        <path d="M37,67 Q45,62 53,67" stroke="#1A0A08" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M57,67 Q65,62 73,67" stroke="#1A0A08" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M52,87 Q55,91 58,87" stroke="#C08040" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M42,97 Q55,112 68,97" stroke="#904020" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M45,97 Q55,108 65,97 L65,98 Q55,110 45,98 Z" fill="white"/>
        <ellipse cx="37" cy="91" rx="9" ry="5" fill="#FFD080" opacity="0.5"/>
        <ellipse cx="73" cy="91" rx="9" ry="5" fill="#FFD080" opacity="0.5"/>
        <rect x="87" y="70" width="3" height="14" rx="1" fill="#EF9F27" transform="rotate(15 87 70)"/>
        <path d="M89,84 L91,88 L85,86 Z" fill="#FDDBC9" transform="rotate(15 87 84)"/>
        <rect x="50" y="111" width="10" height="12" rx="5" fill="#F0C07A"/>
        <path d="M20,148 Q36,124 55,128 Q74,124 90,148 Z" fill="#BA7517"/>
        <path d="M20,148 Q30,132 38,128 Q46,126 55,128" fill="none" stroke="#EF9F27" strokeWidth="1.5"/>
        <path d="M90,148 Q80,132 72,128 Q64,126 55,128" fill="none" stroke="#EF9F27" strokeWidth="1.5"/>
        <path d="M46,128 L55,144 L64,128" fill="#D08820"/>
      </svg>
    ),
  };

  return portraits[id] || null;
}
