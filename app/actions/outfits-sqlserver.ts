"use server"

import sql from "mssql"
import { cookies } from "next/headers"
import { OutfitRecommendationEngine, type Prenda, type UserProfile } from "@/lib/outfit-recommendations"

// Configuración de SQL Server
const config = {
  user: process.env.SQLSERVER_USER || "sa",
  password: process.env.SQLSERVER_PASSWORD || "YourPassword123!",
  server: process.env.SQLSERVER_HOST || "localhost",
  database: process.env.SQLSERVER_DATABASE || "FitStyleDB",
  options: {
    encrypt: false, // Para desarrollo local
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

async function getConnection() {
  try {
    const pool = await sql.connect(config)
    return pool
  } catch (error) {
    console.error("SQL Server connection error:", error)
    throw error
  }
}

export async function getOutfitRecommendationsSQLServer(filters?: {
  ocasion?: string
  temporada?: string
}) {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    pool = await getConnection()

    // Obtener perfil del usuario
    const userResult = await pool
      .request()
      .input("userId", sql.Int, Number.parseInt(userId))
      .query(`
        SELECT id_usuario, genero, pieles_id_piel, altura, peso
        FROM usuarios
        WHERE id_usuario = @userId
      `)

    if (userResult.recordset.length === 0) {
      return { success: false, error: "Usuario no encontrado" }
    }

    const userProfile: UserProfile = {
      id: userResult.recordset[0].id_usuario,
      genero: userResult.recordset[0].genero,
      pieles_id_piel: userResult.recordset[0].pieles_id_piel,
      altura: userResult.recordset[0].altura,
      peso: userResult.recordset[0].peso,
    }

    // Obtener todas las prendas con información completa
    const prendasResult = await pool.request().query(`
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
        INNER JOIN colores c ON p.colores_id_color = c.id_color
        INNER JOIN marcas m ON p.marcas_id_marca = m.id_marca
        INNER JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
        INNER JOIN temporadas t ON p.temporadas_id_temporada = t.id_temporada
        INNER JOIN ocasiones o ON p.ocasiones_id_ocasion = o.id_ocasion
      `)

    const prendas: Prenda[] = prendasResult.recordset.map((row) => ({
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
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

export async function saveOutfitSQLServer(outfitData: {
  nombre: string
  prendas: number[]
}) {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    pool = await getConnection()

    // Create outfit
    const outfitResult = await pool
      .request()
      .input("nombre", sql.VarChar, outfitData.nombre)
      .input("userId", sql.Int, Number.parseInt(userId))
      .query(`
        INSERT INTO outfits (nombre, usuarios_id_usuario)
        OUTPUT INSERTED.id_outfit
        VALUES (@nombre, @userId)
      `)

    if (outfitResult.recordset.length === 0) {
      return { success: false, error: "Error al crear outfit" }
    }

    const outfitId = outfitResult.recordset[0].id_outfit

    // Add prendas to outfit
    for (const prendaId of outfitData.prendas) {
      await pool
        .request()
        .input("prendaId", sql.Int, prendaId)
        .input("outfitId", sql.Int, outfitId)
        .query(`
          INSERT INTO prendas_outfits (prendas_id_prenda, outfits_id_outfit)
          VALUES (@prendaId, @outfitId)
        `)
    }

    return { success: true, outfitId }
  } catch (error) {
    console.error("Save outfit error:", error)
    return { success: false, error: "Error al guardar outfit" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

export async function saveOutfitAsFavoriteSQLServer(outfitData: {
  outfitId: number
  prendaSuperiorId: number
  prendaInferiorId: number
  comentario: string
  estrellas: number
}) {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    pool = await getConnection()

    // Crear outfit en la base de datos
    const outfitResult = await pool
      .request()
      .input("nombre", sql.VarChar, `Outfit Favorito #${outfitData.outfitId}`)
      .input("userId", sql.Int, Number.parseInt(userId))
      .query(`
        INSERT INTO outfits (nombre, usuarios_id_usuario)
        OUTPUT INSERTED.id_outfit
        VALUES (@nombre, @userId)
      `)

    if (outfitResult.recordset.length === 0) {
      return { success: false, error: "Error al crear outfit" }
    }

    const dbOutfitId = outfitResult.recordset[0].id_outfit

    // Agregar prendas al outfit
    await pool
      .request()
      .input("prendaSuperiorId", sql.Int, outfitData.prendaSuperiorId)
      .input("prendaInferiorId", sql.Int, outfitData.prendaInferiorId)
      .input("outfitId", sql.Int, dbOutfitId)
      .query(`
        INSERT INTO prendas_outfits (prendas_id_prenda, outfits_id_outfit)
        VALUES 
          (@prendaSuperiorId, @outfitId),
          (@prendaInferiorId, @outfitId)
      `)

    // Crear valoración
    await pool
      .request()
      .input("comentario", sql.VarChar, outfitData.comentario)
      .input("estrellas", sql.SmallInt, outfitData.estrellas)
      .input("outfitId", sql.Int, dbOutfitId)
      .query(`
        INSERT INTO valoraciones (comentario, estrellas, outfits_id_outfit)
        VALUES (@comentario, @estrellas, @outfitId)
      `)

    return { success: true, outfitId: dbOutfitId }
  } catch (error) {
    console.error("Save outfit as favorite error:", error)
    return { success: false, error: "Error al guardar outfit favorito" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

export async function getFavoriteOutfitsSQLServer() {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    pool = await getConnection()

    const favorites = await pool
      .request()
      .input("userId", sql.Int, Number.parseInt(userId))
      .query(`
        SELECT 
          o.id_outfit,
          o.nombre as outfit_nombre,
          o.created_at,
          v.comentario,
          v.estrellas,
          p.id_prenda as prenda_id,
          p.nombre as prenda_nombre,
          p.precio as prenda_precio,
          p.url_imagen as prenda_url_imagen,
          c.nombre as color_nombre,
          c.codigo_hsl as color_hsl,
          p.descripcion as prenda_descripcion,
          p.material as prenda_material,
          p.url as prenda_url,
          m.nombre as marca_nombre,
          tp.nombre as tipo_nombre
        FROM outfits o
        INNER JOIN valoraciones v ON o.id_outfit = v.outfits_id_outfit
        INNER JOIN prendas_outfits po ON o.id_outfit = po.outfits_id_outfit
        INNER JOIN prendas p ON po.prendas_id_prenda = p.id_prenda
        INNER JOIN colores c ON p.colores_id_color = c.id_color
        INNER JOIN marcas m ON p.marcas_id_marca = m.id_marca
        INNER JOIN tipo_prendas tp ON p.tipo_prendas_id_tipo = tp.id_tipo
        WHERE o.usuarios_id_usuario = @userId
        ORDER BY o.created_at DESC
      `)

    // Agrupar por outfit
    const outfitsMap = new Map()

    favorites.recordset.forEach((row) => {
      const outfitId = row.id_outfit

      if (!outfitsMap.has(outfitId)) {
        outfitsMap.set(outfitId, {
          id_outfit: row.id_outfit,
          outfit_nombre: row.outfit_nombre,
          created_at: row.created_at,
          comentario: row.comentario,
          estrellas: row.estrellas,
          prendas: [],
        })
      }

      outfitsMap.get(outfitId).prendas.push({
        id: row.prenda_id,
        nombre: row.prenda_nombre,
        precio: Number.parseFloat(row.prenda_precio),
        url_imagen: row.prenda_url_imagen,
        color_nombre: row.color_nombre,
        color_hsl: row.color_hsl,
        descripcion: row.prenda_descripcion,
        material: row.prenda_material,
        url: row.prenda_url,
        marca_nombre: row.marca_nombre,
        tipo_nombre: row.tipo_nombre,
      })
    })

    const result = Array.from(outfitsMap.values())

    return { success: true, data: result }
  } catch (error) {
    console.error("Get favorite outfits error:", error)
    return { success: false, error: "Error al obtener outfits favoritos" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}
