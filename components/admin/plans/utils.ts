export const fmtPrice = (n: number | undefined | null) =>
  (n ?? 0).toLocaleString('fr-MG') + ' Ar'