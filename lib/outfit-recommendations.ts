import {
  getColorsForSkinTone,
  getColorsForSeason,
  getColorsForOccasion,
  parseHSL,
  calculateColorCompatibility,
} from "./color-theory"

export interface UserProfile {
  id: number
  genero: boolean // true = masculino, false = femenino
  pieles_id_piel: number
  altura?: number
  peso?: number
}

export interface Prenda {
  id_prenda: number
  nombre: string
  descripcion?: string
  precio: number
  genero: boolean
  material?: string
  url?: string
  url_imagen?: string
  tipo_prendas_id_tipo: number
  temporadas_id_temporada: number
  colores_id_color: number
  ocasiones_id_ocasion: number
  marcas_id_marca: number
  // Datos relacionados
  color_nombre: string
  color_hsl: string
  marca_nombre: string
  tipo_nombre: string
  es_parte_superior: boolean
  temporada_nombre: string
  ocasion_nombre: string
}

export interface OutfitRecommendation {
  id: number
  prendaSuperior: Prenda
  prendaInferior: Prenda
  precioTotal: number
  compatibilidadColor: number
  razonRecomendacion: string[]
  puntuacion: number
}

export class OutfitRecommendationEngine {
  private prendas: Prenda[] = []
  private userProfile: UserProfile | null = null

  constructor(prendas: Prenda[], userProfile: UserProfile) {
    this.prendas = prendas
    this.userProfile = userProfile
  }

  // Filtrar prendas según criterios
  private filterPrendas(filters: {
    ocasion?: number
    temporada?: number
    genero?: boolean
    esParteSuperior?: boolean
  }): Prenda[] {
    return this.prendas.filter((prenda) => {
      // Filtro por género
      if (filters.genero !== undefined && prenda.genero !== filters.genero) {
        return false
      }

      // Filtro por ocasión
      if (filters.ocasion && prenda.ocasiones_id_ocasion !== filters.ocasion) {
        return false
      }

      // Filtro por temporada
      if (filters.temporada && prenda.temporadas_id_temporada !== filters.temporada) {
        return false
      }

      // Filtro por tipo (superior/inferior)
      if (filters.esParteSuperior !== undefined && prenda.es_parte_superior !== filters.esParteSuperior) {
        return false
      }

      return true
    })
  }

  // Calcular puntuación de una prenda para el usuario
  private calculatePrendaScore(prenda: Prenda, filters: { ocasion?: number; temporada?: number }): number {
    if (!this.userProfile) return 50

    let score = 50 // Puntuación base

    // Puntuación por tono de piel
    const skinToneColors = getColorsForSkinTone(this.userProfile.pieles_id_piel)
    if (skinToneColors.recommended.includes(prenda.colores_id_color)) {
      score += 25
    } else if (skinToneColors.avoid.includes(prenda.colores_id_color)) {
      score -= 15
    }

    // Puntuación por temporada
    if (filters.temporada) {
      const seasonColors = getColorsForSeason(filters.temporada)
      if (seasonColors.includes(prenda.colores_id_color)) {
        score += 15
      }
    }

    // Puntuación por ocasión
    if (filters.ocasion) {
      const occasionColors = getColorsForOccasion(filters.ocasion)
      if (occasionColors.includes(prenda.colores_id_color)) {
        score += 15
      }
    }

    // Puntuación por precio (favorece precios medios)
    if (prenda.precio < 200) {
      score += 10
    } else if (prenda.precio > 400) {
      score -= 5
    }

    return Math.max(0, Math.min(100, score))
  }

  // Generar recomendaciones de outfits
  generateRecommendations(
    filters: {
      ocasion?: number
      temporada?: number
      limit?: number
    } = {},
  ): OutfitRecommendation[] {
    if (!this.userProfile) return []

    const limit = filters.limit || 6

    // Filtrar prendas superiores e inferiores
    const prendasSuperiores = this.filterPrendas({
      genero: this.userProfile.genero,
      esParteSuperior: true,
      ocasion: filters.ocasion,
      temporada: filters.temporada,
    })

    const prendasInferiores = this.filterPrendas({
      genero: this.userProfile.genero,
      esParteSuperior: false,
      ocasion: filters.ocasion,
      temporada: filters.temporada,
    })

    // Calcular puntuaciones para cada prenda
    const prendasSuperioresConScore = prendasSuperiores
      .map((prenda) => ({
        prenda,
        score: this.calculatePrendaScore(prenda, filters),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 superiores

    const prendasInferioresConScore = prendasInferiores
      .map((prenda) => ({
        prenda,
        score: this.calculatePrendaScore(prenda, filters),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 inferiores

    // Generar combinaciones
    const outfits: OutfitRecommendation[] = []
    let outfitId = 1

    for (const superior of prendasSuperioresConScore) {
      for (const inferior of prendasInferioresConScore) {
        const outfit = this.createOutfitRecommendation(outfitId++, superior.prenda, inferior.prenda, filters)
        outfits.push(outfit)
      }
    }

    // Ordenar por puntuación y retornar los mejores
    return outfits.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, limit)
  }

  // Crear recomendación de outfit
  private createOutfitRecommendation(
    id: number,
    prendaSuperior: Prenda,
    prendaInferior: Prenda,
    filters: { ocasion?: number; temporada?: number },
  ): OutfitRecommendation {
    const colorSuperior = parseHSL(prendaSuperior.color_hsl)
    const colorInferior = parseHSL(prendaInferior.color_hsl)

    const compatibilidadColor = calculateColorCompatibility(colorSuperior, colorInferior)
    const precioTotal = prendaSuperior.precio + prendaInferior.precio

    // Calcular puntuación total del outfit
    const scoreSuperior = this.calculatePrendaScore(prendaSuperior, filters)
    const scoreInferior = this.calculatePrendaScore(prendaInferior, filters)
    const scorePromedio = (scoreSuperior + scoreInferior) / 2

    // Bonificación por compatibilidad de colores
    const bonificacionColor = compatibilidadColor > 80 ? 15 : compatibilidadColor > 60 ? 10 : 0

    // Penalización por precio muy alto
    const penalizacionPrecio = precioTotal > 600 ? -10 : 0

    const puntuacion = Math.max(0, Math.min(100, scorePromedio + bonificacionColor + penalizacionPrecio))

    // Generar razones de recomendación
    const razones = this.generateRecommendationReasons(prendaSuperior, prendaInferior, compatibilidadColor, filters)

    return {
      id,
      prendaSuperior,
      prendaInferior,
      precioTotal,
      compatibilidadColor,
      razonRecomendacion: razones,
      puntuacion,
    }
  }

  // Generar razones de recomendación
  private generateRecommendationReasons(
    superior: Prenda,
    inferior: Prenda,
    compatibilidadColor: number,
    filters: { ocasion?: number; temporada?: number },
  ): string[] {
    const razones: string[] = []

    if (!this.userProfile) return razones

    // Razones por tono de piel
    const skinToneColors = getColorsForSkinTone(this.userProfile.pieles_id_piel)
    if (skinToneColors.recommended.includes(superior.colores_id_color)) {
      razones.push(`El ${superior.color_nombre} complementa tu tono de piel`)
    }
    if (skinToneColors.recommended.includes(inferior.colores_id_color)) {
      razones.push(`El ${inferior.color_nombre} realza tu tono natural`)
    }

    // Razones por compatibilidad de colores
    if (compatibilidadColor > 85) {
      razones.push("Excelente armonía de colores")
    } else if (compatibilidadColor > 70) {
      razones.push("Buena combinación cromática")
    }

    // Razones por temporada
    if (filters.temporada) {
      const seasonColors = getColorsForSeason(filters.temporada)
      if (seasonColors.includes(superior.colores_id_color) || seasonColors.includes(inferior.colores_id_color)) {
        const temporadas = ["", "Invierno", "Verano", "Otoño", "Primavera"]
        razones.push(`Perfecto para ${temporadas[filters.temporada]}`)
      }
    }

    // Razones por ocasión
    if (filters.ocasion) {
      const ocasiones = ["", "Casual", "Deporte", "Formal"]
      razones.push(`Ideal para ocasiones ${ocasiones[filters.ocasion].toLowerCase()}`)
    }

    // Razones por precio
    if (superior.precio + inferior.precio < 300) {
      razones.push("Excelente relación calidad-precio")
    }

    // Razones por materiales
    if (superior.material?.includes("algodón") || inferior.material?.includes("algodón")) {
      razones.push("Materiales cómodos y transpirables")
    }

    return razones.slice(0, 3) // Máximo 3 razones
  }
}
