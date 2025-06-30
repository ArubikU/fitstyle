// Teoría del color y recomendaciones
export interface ColorHSL {
  h: number // Hue (0-360)
  s: number // Saturation (0-100)
  l: number // Lightness (0-100)
}

export interface ColorRecommendation {
  colorId: number
  colorName: string
  colorHsl: string
  compatibility: number // 0-100
  reason: string
}

// Parsear HSL string a objeto
export function parseHSL(hslString: string): ColorHSL {
  const match = hslString.match(/hsl$$(\d+),\s*(\d+)%,\s*(\d+)%$$/)
  if (!match) return { h: 0, s: 0, l: 50 }

  return {
    h: Number.parseInt(match[1]),
    s: Number.parseInt(match[2]),
    l: Number.parseInt(match[3]),
  }
}

// Convertir HSL object a string
export function hslToString(hsl: ColorHSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

// Calcular diferencia de matiz
function hueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2)
  return Math.min(diff, 360 - diff)
}

// Esquemas de color según teoría del color
export function getColorHarmony(baseColor: ColorHSL): {
  complementary: ColorHSL[]
  analogous: ColorHSL[]
  triadic: ColorHSL[]
  neutral: ColorHSL[]
} {
  return {
    // Colores complementarios (opuestos en el círculo cromático)
    complementary: [{ ...baseColor, h: (baseColor.h + 180) % 360 }],

    // Colores análogos (adyacentes en el círculo cromático)
    analogous: [
      { ...baseColor, h: (baseColor.h + 30) % 360 },
      { ...baseColor, h: (baseColor.h - 30 + 360) % 360 },
    ],

    // Colores triádicos (120° de separación)
    triadic: [
      { ...baseColor, h: (baseColor.h + 120) % 360 },
      { ...baseColor, h: (baseColor.h + 240) % 360 },
    ],

    // Colores neutrales
    neutral: [
      { h: 0, s: 0, l: 90 }, // Blanco
      { h: 0, s: 0, l: 20 }, // Negro
      { h: 30, s: 10, l: 70 }, // Beige
      { h: 0, s: 0, l: 50 }, // Gris
    ],
  }
}

// Recomendaciones de colores según tono de piel
export function getColorsForSkinTone(skinToneId: number): {
  recommended: number[] // IDs de colores recomendados
  avoid: number[] // IDs de colores a evitar
} {
  const recommendations = {
    1: {
      // Blanco
      recommended: [1, 7, 10, 11], // Azul, Morado, Pure Ruby, Verde
      avoid: [2, 12], // Beige, Wonder Beige
    },
    2: {
      // Trigueño
      recommended: [2, 5, 6, 12], // Beige, Cream White, Marrón, Wonder Beige
      avoid: [8, 3], // Negro, Black
    },
    3: {
      // Moreno
      recommended: [4, 5, 9, 10], // Blanco, Cream White, Preloved Teal, Pure Ruby
      avoid: [2, 12], // Beige, Wonder Beige
    },
    4: {
      // Negro
      recommended: [4, 5, 12, 10], // Blanco, Cream White, Wonder Beige, Pure Ruby
      avoid: [8, 3], // Negro, Black
    },
  }

  return recommendations[skinToneId as keyof typeof recommendations] || { recommended: [], avoid: [] }
}

// Colores según temporada
export function getColorsForSeason(seasonId: number): number[] {
  const seasonColors = {
    1: [3, 8, 6, 7], // Invierno: Black, Negro, Marrón, Morado
    2: [4, 5, 1, 11], // Verano: Blanco, Cream White, Azul, Verde
    3: [6, 2, 12, 10], // Otoño: Marrón, Beige, Wonder Beige, Pure Ruby
    4: [11, 1, 5, 9], // Primavera: Verde, Azul, Cream White, Preloved Teal
  }

  return seasonColors[seasonId as keyof typeof seasonColors] || []
}

// Colores según ocasión
export function getColorsForOccasion(occasionId: number): number[] {
  const occasionColors = {
    1: [1, 2, 4, 11, 12], // Casual: Azul, Beige, Blanco, Verde, Wonder Beige
    2: [3, 8, 1, 11], // Deporte: Black, Negro, Azul, Verde
    3: [3, 8, 4, 7, 10], // Formal: Black, Negro, Blanco, Morado, Pure Ruby
  }

  return occasionColors[occasionId as keyof typeof occasionColors] || []
}

// Calcular compatibilidad entre dos colores
export function calculateColorCompatibility(color1: ColorHSL, color2: ColorHSL): number {
  const hueDiff = hueDifference(color1.h, color2.h)
  const satDiff = Math.abs(color1.s - color2.s)
  const lightDiff = Math.abs(color1.l - color2.l)

  // Esquemas armoniosos
  if (hueDiff < 30) return 85 // Análogos
  if (Math.abs(hueDiff - 180) < 20) return 90 // Complementarios
  if (Math.abs(hueDiff - 120) < 20 || Math.abs(hueDiff - 240) < 20) return 80 // Triádicos

  // Neutrales siempre combinan bien
  if (color1.s < 20 || color2.s < 20) return 75

  // Contraste de luminosidad
  if (lightDiff > 40) return 70

  // Colores similares en saturación
  if (satDiff < 20) return 65

  return 50 // Compatibilidad básica
}
