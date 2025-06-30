"use server"

import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import { OutfitRecommendationEngine, type Prenda, type UserProfile } from "@/lib/outfit-recommendations"

const sql = neon(process.env.DATABASE_URL!)

export async function getOutfitRecommendations(filters?: {
  ocasion?: string
  temporada?: string
}) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    // Obtener perfil del usuario
    const userResult = await sql`
      SELECT id_usuario, genero, pieles_id_piel, altura, peso
      FROM usuarios
      WHERE id_usuario = ${Number.parseInt(userId)}
    `

    if (userResult.length === 0) {
      return { success: false, error: "Usuario no encontrado" }
    }

    const userProfile: UserProfile = {
      id: userResult[0].id_usuario,
      genero: userResult[0].genero,
      pieles_id_piel: userResult[0].pieles_id_piel,
      altura: userResult[0].altura,
      peso: userResult[0].peso,
    }

    // Obtener todas las prendas con información completa
    const prendasResult = await sql`
      SELECT 
        p.id_prenda,
        p.nombre,
        p.descripcion,
        p.precio,
        p.genero,
        p.material,
        p.url,
        p.url_imagen,
        p.tipo_prendas_id_tipo,
        p.temporadas_id_temporada,
        p.colores_id_color,
        p.ocasiones_id_ocasion,
        p.marcas_id_marca,
        c.nombre as color_nombre,
        c.codigo_hsl as color_hsl,
        m.nombre as marca_nombre,
        tp.nombre as tipo_nombre,
        tp.es_parte_superior,
        t.nombre as temporada_nombre,
        o.nombre as ocasion_nombre
      FROM prendas p
      JOIN colores c ON p.colores_id_color = c.id_color
      JOIN marcas m ON p.marcas_id_marca = m.id_marca
      JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
      JOIN temporadas t ON p.temporadas_id_temporada = t.id_temporada
      JOIN ocasiones o ON p.ocasiones_id_ocasion = o.id_ocasion
    `

    const prendas: Prenda[] = prendasResult.map((row) => ({
      id_prenda: row.id_prenda,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: Number.parseFloat(row.precio),
      genero: row.genero,
      material: row.material,
      url: row.url,
      url_imagen: row.url_imagen,
      tipo_prendas_id_tipo: row.tipo_prendas_id_tipo,
      temporadas_id_temporada: row.temporadas_id_temporada,
      colores_id_color: row.colores_id_color,
      ocasiones_id_ocasion: row.ocasiones_id_ocasion,
      marcas_id_marca: row.marcas_id_marca,
      color_nombre: row.color_nombre,
      color_hsl: row.color_hsl,
      marca_nombre: row.marca_nombre,
      tipo_nombre: row.tipo_nombre,
      es_parte_superior: row.es_parte_superior,
      temporada_nombre: row.temporada_nombre,
      ocasion_nombre: row.ocasion_nombre,
    }))

    // Crear motor de recomendaciones
    const engine = new OutfitRecommendationEngine(prendas, userProfile)

    // Generar recomendaciones
    const recommendations = engine.generateRecommendations({
      ocasion: filters?.ocasion ? Number.parseInt(filters.ocasion) : undefined,
      temporada: filters?.temporada ? Number.parseInt(filters.temporada) : undefined,
      limit: 6,
    })

    // Convertir a formato esperado por el frontend
    const outfits = recommendations.map((rec) => ({
      outfit_id: rec.id,
      prenda_superior_id: rec.prendaSuperior.id_prenda,
      prenda_superior_nombre: rec.prendaSuperior.nombre,
      prenda_superior_descripcion: rec.prendaSuperior.descripcion,
      prenda_superior_precio: rec.prendaSuperior.precio,
      prenda_superior_material: rec.prendaSuperior.material,
      prenda_superior_url: rec.prendaSuperior.url,
      prenda_superior_imagen: rec.prendaSuperior.url_imagen,
      prenda_superior_color_nombre: rec.prendaSuperior.color_nombre,
      prenda_superior_color_hsl: rec.prendaSuperior.color_hsl,
      prenda_superior_marca: rec.prendaSuperior.marca_nombre,
      prenda_inferior_id: rec.prendaInferior.id_prenda,
      prenda_inferior_nombre: rec.prendaInferior.nombre,
      prenda_inferior_descripcion: rec.prendaInferior.descripcion,
      prenda_inferior_precio: rec.prendaInferior.precio,
      prenda_inferior_material: rec.prendaInferior.material,
      prenda_inferior_url: rec.prendaInferior.url,
      prenda_inferior_imagen: rec.prendaInferior.url_imagen,
      prenda_inferior_color_nombre: rec.prendaInferior.color_nombre,
      prenda_inferior_color_hsl: rec.prendaInferior.color_hsl,
      prenda_inferior_marca: rec.prendaInferior.marca_nombre,
      precio_total: rec.precioTotal,
      compatibilidad_color: rec.compatibilidadColor,
      razones_recomendacion: rec.razonRecomendacion,
      puntuacion: rec.puntuacion,
    }))

    return { success: true, data: outfits }
  } catch (error) {
    console.error("Get outfit recommendations error:", error)
    return { success: false, error: "Error al obtener recomendaciones" }
  }
}

export async function saveOutfit(outfitData: {
  nombre: string
  prendas: number[]
}) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    // Create outfit
    const outfitResult = await sql`
      INSERT INTO outfits (nombre, usuarios_id_usuario)
      VALUES (${outfitData.nombre}, ${Number.parseInt(userId)})
      RETURNING id_outfit
    `

    if (outfitResult.length === 0) {
      return { success: false, error: "Error al crear outfit" }
    }

    const outfitId = outfitResult[0].id_outfit

    // Add prendas to outfit
    for (const prendaId of outfitData.prendas) {
      await sql`
        INSERT INTO prendas_outfits (prendas_id_prenda, outfits_id_outfit)
        VALUES (${prendaId}, ${outfitId})
      `
    }

    return { success: true, outfitId }
  } catch (error) {
    console.error("Save outfit error:", error)
    return { success: false, error: "Error al guardar outfit" }
  }
}

export async function saveOutfitAsFavorite(outfitData: {
  outfitId: number
  prendaSuperiorId: number
  prendaInferiorId: number
  comentario: string
  estrellas: number
}) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    // Crear outfit en la base de datos
    const outfitResult = await sql`
      INSERT INTO outfits (nombre, usuarios_id_usuario)
      VALUES (${`Outfit Favorito #${outfitData.outfitId}`}, ${Number.parseInt(userId)})
      RETURNING id_outfit
    `

    if (outfitResult.length === 0) {
      return { success: false, error: "Error al crear outfit" }
    }

    const dbOutfitId = outfitResult[0].id_outfit

    // Agregar prendas al outfit
    await sql`
      INSERT INTO prendas_outfits (prendas_id_prenda, outfits_id_outfit)
      VALUES 
        (${outfitData.prendaSuperiorId}, ${dbOutfitId}),
        (${outfitData.prendaInferiorId}, ${dbOutfitId})
    `

    // Crear valoración
    await sql`
      INSERT INTO valoraciones (comentario, estrellas, outfits_id_outfit)
      VALUES (${outfitData.comentario}, ${outfitData.estrellas}, ${dbOutfitId})
    `

    return { success: true, outfitId: dbOutfitId }
  } catch (error) {
    console.error("Save outfit as favorite error:", error)
    return { success: false, error: "Error al guardar outfit favorito" }
  }
}

export async function getFavoriteOutfits() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    const favorites = await sql`
      SELECT 
        o.id_outfit,
        o.nombre as outfit_nombre,
        o.created_at,
        v.comentario,
        v.estrellas,
        array_agg(
          json_build_object(
            'id', p.id_prenda,
            'nombre', p.nombre,
            'precio', p.precio,
            'url_imagen', p.url_imagen,
            'color_nombre', c.nombre,
            'color_hsl', c.codigo_hsl
          )
        ) as prendas
      FROM outfits o
      JOIN valoraciones v ON o.id_outfit = v.outfits_id_outfit
      JOIN prendas_outfits po ON o.id_outfit = po.outfits_id_outfit
      JOIN prendas p ON po.prendas_id_prenda = p.id_prenda
      JOIN colores c ON p.colores_id_color = c.id_color
      WHERE o.usuarios_id_usuario = ${Number.parseInt(userId)}
      GROUP BY o.id_outfit, o.nombre, o.created_at, v.comentario, v.estrellas
      ORDER BY o.created_at DESC
    `

    return { success: true, data: favorites }
  } catch (error) {
    console.error("Get favorite outfits error:", error)
    return { success: false, error: "Error al obtener outfits favoritos" }
  }
}
