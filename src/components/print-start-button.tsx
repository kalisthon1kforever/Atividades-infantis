"use client";

export function PrintStartButton() {
  return (
    <button type="button" className="btn no-print" onClick={() => window.print()}>
      🖨️ Imprimir
    </button>
  );
}
