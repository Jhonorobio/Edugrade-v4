export function calcularPromedioPeriodo(
  calificaciones: Record<string, (number | null)[]>,
  pesosCategorias: Record<string, number>,
): number | null {
  let sumaPonderada = 0
  let pesoTotal = 0

  for (const [categoria, notas] of Object.entries(calificaciones)) {
    const notasValidas = notas.filter((n): n is number => n !== null)
    if (notasValidas.length === 0) continue

    const promedioCategoria = notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
    const peso = (pesosCategorias[categoria] || 0) / 100
    sumaPonderada += promedioCategoria * peso
    pesoTotal += peso
  }

  if (pesoTotal === 0) return null
  return Math.round((sumaPonderada / pesoTotal) * 100) / 100
}

export function calcularPromedioFinal(
  promediosPeriodos: (number | null)[],
  pesosPeriodos: Record<string, number>,
): number | null {
  let sumaPonderada = 0
  let pesoTotal = 0

  promediosPeriodos.forEach((promedio, index) => {
    if (promedio === null) return
    const peso = (pesosPeriodos[`period_${index + 1}`] || 0) / 100
    sumaPonderada += promedio * peso
    pesoTotal += peso
  })

  if (pesoTotal === 0) return null
  return Math.round((sumaPonderada / pesoTotal) * 100) / 100
}

export function determinarNivelDesempeno(
  promedio: number,
  niveles: { label: string; min: number; max: number; color: string }[],
) {
  return niveles.find((n) => promedio >= n.min && promedio <= n.max)
}

export function formatNota(nota: number | null, decimales = 1): string {
  if (nota === null) return '-'
  return nota.toFixed(decimales)
}
