export function dentroDe48h(compraIso: string, acessoIso: string): boolean {
  const compra = new Date(compraIso).getTime();
  const acesso = new Date(acessoIso).getTime();
  if (!Number.isFinite(compra) || !Number.isFinite(acesso)) return false;
  const delta = acesso - compra;
  return delta >= 0 && delta <= 48 * 60 * 60 * 1000;
}
