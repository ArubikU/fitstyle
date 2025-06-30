"use server"

import sql from "mssql"
import { cookies } from "next/headers"

// Configuración de SQL Server
const config = {
  user: process.env.SQLSERVER_USER || "sa",
  password: process.env.SQLSERVER_PASSWORD || "YourPassword123!",
  server: process.env.SQLSERVER_HOST || "localhost",
  database: process.env.SQLSERVER_DATABASE || "FitStyleDB",
  options: {
    encrypt: false,
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

// Usar la función SQL Server para recomendaciones
export async function getOutfitRecommendationsWithFunctionSQLServer(filters?: {
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

    // Usar la función de SQL Server
    const result = await pool
      .request()
      .input("usuario_id", sql.Int, Number.parseInt(userId))
      .input("ocasion_id", sql.Int, filters?.ocasion ? Number.parseInt(filters.ocasion) : null)
      .input("temporada_id", sql.Int, filters?.temporada ? Number.parseInt(filters.temporada) : null)
      .query(`
        SELECT * FROM dbo.recomendar_outfit(@usuario_id, @ocasion_id, @temporada_id)
      `)

    return { success: true, data: result.recordset }
  } catch (error) {
    console.error("Get outfit recommendations error:", error)
    return { success: false, error: "Error al obtener recomendaciones" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

// Obtener colores recomendados por tono de piel
export async function getRecommendedColorsBySkinToneSQLServer(skinToneId: number) {
  let pool: sql.ConnectionPool | null = null

  try {
    pool = await getConnection()

    const result = await pool
      .request()
      .input("piel_id", sql.Int, skinToneId)
      .query(`
        SELECT * FROM dbo.colores_recomendados_por_piel(@piel_id)
      `)

    return { success: true, data: result.recordset }
  } catch (error) {
    console.error("Get recommended colors error:", error)
    return { success: false, error: "Error al obtener colores recomendados" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

// Obtener estadísticas del usuario
export async function getUserStatisticsSQLServer() {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    pool = await getConnection()

    const result = await pool
      .request()
      .input("usuario_id", sql.Int, Number.parseInt(userId))
      .execute("dbo.sp_obtener_estadisticas_usuario")

    return { success: true, data: result.recordset[0] }
  } catch (error) {
    console.error("Get user statistics error:", error)
    return { success: false, error: "Error al obtener estadísticas" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

// Obtener prendas por temporada
export async function getClothingBySeasonSQLServer(seasonId: number, gender: boolean, limit = 10) {
  let pool: sql.ConnectionPool | null = null

  try {
    pool = await getConnection()

    const result = await pool
      .request()
      .input("temporada_id", sql.Int, seasonId)
      .input("genero", sql.Bit, gender)
      .input("limite", sql.Int, limit)
      .query(`
        SELECT * FROM dbo.obtener_prendas_por_temporada(@temporada_id, @genero, @limite)
      `)

    return { success: true, data: result.recordset }
  } catch (error) {
    console.error("Get clothing by season error:", error)
    return { success: false, error: "Error al obtener prendas por temporada" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

// Calcular compatibilidad entre dos colores
export async function calculateColorCompatibilitySQLServer(color1Hsl: string, color2Hsl: string) {
  let pool: sql.ConnectionPool | null = null

  try {
    pool = await getConnection()

    const result = await pool
      .request()
      .input("color1_hsl", sql.NVarChar, color1Hsl)
      .input("color2_hsl", sql.NVarChar, color2Hsl)
      .query(`
        SELECT dbo.calcular_compatibilidad_colores(@color1_hsl, @color2_hsl) as compatibilidad
      `)

    return { success: true, data: result.recordset[0].compatibilidad }
  } catch (error) {
    console.error("Calculate color compatibility error:", error)
    return { success: false, error: "Error al calcular compatibilidad" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

// Obtener vista de outfits completos
export async function getCompleteOutfitsSQLServer() {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return { success: false, error: "Usuario no autenticado" }
    }

    pool = await getConnection()

    const result = await pool
      .request()
      .input("usuario_id", sql.Int, Number.parseInt(userId))
      .query(`
        SELECT * FROM dbo.vw_outfits_completos 
        WHERE usuario_email = (SELECT email FROM usuarios WHERE id_usuario = @usuario_id)
        ORDER BY created_at DESC
      `)

    return { success: true, data: result.recordset }
  } catch (error) {
    console.error("Get complete outfits error:", error)
    return { success: false, error: "Error al obtener outfits completos" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}
