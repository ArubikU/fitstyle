"use server"

import sql from "mssql"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

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

export async function registerUserSQLServer(userData: {
  nombre: string
  email: string
  contrasena: string
  altura: string
  peso: string
  genero: string
  piel: string
}) {
  let pool: sql.ConnectionPool | null = null

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10)

    pool = await getConnection()

    // Check if user exists
    const existingUserResult = await pool
      .request()
      .input("email", sql.VarChar, userData.email)
      .query("SELECT id_usuario FROM usuarios WHERE email = @email")

    if (existingUserResult.recordset.length > 0) {
      return { success: false, error: "El email ya está registrado" }
    }

    // Insert user
    const insertResult = await pool
      .request()
      .input("nombre", sql.VarChar, userData.nombre)
      .input("email", sql.VarChar, userData.email)
      .input("contrasena", sql.VarChar, hashedPassword)
      .input("altura", sql.Decimal(5, 2), userData.altura ? Number.parseFloat(userData.altura) : null)
      .input("peso", sql.Decimal(5, 2), userData.peso ? Number.parseFloat(userData.peso) : null)
      .input("genero", sql.Bit, userData.genero === "true")
      .input("pieles_id_piel", sql.Int, Number.parseInt(userData.piel))
      .input("suscripcion", sql.Bit, false)
      .query(`
        INSERT INTO usuarios (nombre, email, contrasena, altura, peso, genero, pieles_id_piel, suscripcion)
        OUTPUT INSERTED.id_usuario
        VALUES (@nombre, @email, @contrasena, @altura, @peso, @genero, @pieles_id_piel, @suscripcion)
      `)

    if (insertResult.recordset.length > 0) {
      const userId = insertResult.recordset[0].id_usuario

      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set("user_id_sqlserver", userId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return { success: true, userId }
    }

    return { success: false, error: "Error al crear usuario" }
  } catch (error) {
    console.error("Register error:", error)
    return { success: false, error: "Error interno del servidor" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

export async function loginUserSQLServer(userData: {
  email: string
  contrasena: string
}) {
  let pool: sql.ConnectionPool | null = null

  try {
    pool = await getConnection()

    // Find user
    const userResult = await pool
      .request()
      .input("email", sql.VarChar, userData.email)
      .query("SELECT id_usuario, contrasena FROM usuarios WHERE email = @email")

    if (userResult.recordset.length === 0) {
      return { success: false, error: "Email o contraseña incorrectos" }
    }

    const user = userResult.recordset[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(userData.contrasena, user.contrasena)

    if (!isValidPassword) {
      return { success: false, error: "Email o contraseña incorrectos" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id_sqlserver", user.id_usuario.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, userId: user.id_usuario }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Error interno del servidor" }
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}

export async function getCurrentUserSQLServer() {
  let pool: sql.ConnectionPool | null = null

  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id_sqlserver")?.value

    if (!userId) {
      return null
    }

    pool = await getConnection()

    const userResult = await pool
      .request()
      .input("userId", sql.Int, Number.parseInt(userId))
      .query(`
        SELECT u.*, p.nombre as piel_nombre 
        FROM usuarios u
        LEFT JOIN pieles p ON u.pieles_id_piel = p.id_piel
        WHERE u.id_usuario = @userId
      `)

    return userResult.recordset.length > 0 ? userResult.recordset[0] : null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  } finally {
    if (pool) {
      await pool.close()
    }
  }
}
