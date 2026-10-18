import type { Module } from "@/data/content";

export function SheetPreview({ kind }: { kind: Module["preview"] }) {
  const page = { fill: "#ffffff" };
  const stroke = "#9db7dd";

  return (
    <div className="sheet-preview">
      <svg viewBox="0 0 160 110" role="img" aria-label="Prévia ilustrativa de uma página de atividade">
        <rect width="160" height="110" {...page} />
        <rect x="10" y="8" width="70" height="7" rx="3.5" fill="#14306b" opacity="0.85" />
        <rect x="10" y="19" width="44" height="4" rx="2" fill={stroke} opacity="0.6" />

        {kind === "attention" && (
          <g>
            <rect x="10" y="32" width="62" height="30" rx="6" fill="#e7f7ef" stroke="#bfe8d3" />
            <circle cx="26" cy="47" r="7" fill="#fbbf24" />
            <circle cx="48" cy="47" r="7" fill="#fbbf24" />
            <path d="M58 42l5 10h-10z" fill="#fb7185" />
            <rect x="88" y="32" width="62" height="30" rx="6" fill="#eef4fd" stroke="#bfd7f7" />
            <circle cx="104" cy="47" r="7" fill="#0d9f6e" />
            <circle cx="126" cy="47" r="7" fill="#0d9f6e" />
            <path d="M136 42l5 10h-10z" fill="#2563eb" />
            <rect x="10" y="72" width="140" height="6" rx="3" fill="#dbeafe" />
            <rect x="10" y="84" width="110" height="6" rx="3" fill="#dbeafe" />
          </g>
        )}

        {kind === "trace" && (
          <g fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round">
            <path d="M14 88c14-40 30-40 44 0" strokeDasharray="5 5" />
            <path d="M70 88c10-36 24-36 34-8" strokeDasharray="5 5" />
            <path d="M112 50c18 0 18 24 0 24s-18-24 0-24" strokeDasharray="5 5" stroke="#0d9f6e" />
            <circle cx="14" cy="88" r="3.2" fill="#fb7185" stroke="none" />
            <rect x="10" y="34" width="26" height="8" rx="4" fill="#fdeecf" stroke="none" />
          </g>
        )}

        {kind === "letters" && (
          <g>
            <text x="18" y="78" fontFamily="Arial, sans-serif" fontSize="46" fontWeight="700" fill="#14306b" opacity="0.9">Aa</text>
            <text x="78" y="70" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="700" fill="#9db7dd">Aa</text>
            <rect x="78" y="78" width="66" height="3" rx="1.5" fill="#fbbf24" />
            <circle cx="132" cy="42" r="12" fill="#d8f3e6" />
            <text x="132" y="47" textAnchor="middle" fontFamily="Arial" fontSize="13" fontWeight="700" fill="#057a55">A</text>
          </g>
        )}

        {kind === "words" && (
          <g>
            <rect x="14" y="32" width="36" height="36" rx="8" fill="#f1edfc" stroke="#ddd3f8" />
            <text x="32" y="57" textAnchor="middle" fontSize="18">🏠</text>
            <rect x="62" y="38" width="84" height="9" rx="4" fill="#dbeafe" />
            <rect x="62" y="52" width="60" height="9" rx="4" fill="#e7f7ef" />
            <rect x="14" y="78" width="52" height="10" rx="5" fill="#fbbf24" opacity="0.8" />
            <rect x="72" y="78" width="52" height="10" rx="5" fill="#fb7185" opacity="0.8" />
          </g>
        )}

        {kind === "numbers" && (
          <g>
            <circle cx="24" cy="46" r="7" fill="#fb7185" />
            <circle cx="44" cy="46" r="7" fill="#fb7185" />
            <circle cx="64" cy="46" r="7" fill="#fb7185" />
            <circle cx="84" cy="46" r="7" fill="#fb7185" />
            <rect x="112" y="32" width="34" height="34" rx="8" fill="#e7f7ef" stroke="#bfe8d3" />
            <text x="129" y="57" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill="#057a55">4</text>
            <rect x="14" y="76" width="130" height="8" rx="4" fill="#dbeafe" />
          </g>
        )}
      </svg>
    </div>
  );
}
