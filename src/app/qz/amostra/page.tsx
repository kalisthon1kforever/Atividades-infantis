"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AmostraGratis } from "../AmostraGratis";

function AmostraInner() {
  const params = useSearchParams();
  return (
    <AmostraGratis
      name={params.get("nome") || ""}
      email={params.get("email") || ""}
    />
  );
}

export default function AmostraPage() {
  return (
    <div className="qz-root">
      <Suspense fallback={null}>
        <AmostraInner />
      </Suspense>
    </div>
  );
}
