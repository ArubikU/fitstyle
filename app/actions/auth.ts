"use server"

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export async function registerUser(userData: {
  nombre: string
  email: string
  contrasena: string
  altura: string
  peso: string
  genero: string
  piel: string
}) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10)

    // Check if user exists
    const existingUser = await sql`
      SELECT id_usuario FROM usuarios WHERE email = ${userData.email}
    `

    if (existingUser.length > 0) {
      return { success: false, error: "El email ya está registrado" }
    }

    // Insert user
    const result = await sql`
      INSERT INTO usuarios (
        nombre, email, contrasena, altura, peso, genero, pieles_id_piel, suscripcion
      ) VALUES (
        ${userData.nombre},
        ${userData.email},
        ${hashedPassword},
        ${userData.altura ? Number.parseFloat(userData.altura) : null},
        ${userData.peso ? Number.parseFloat(userData.peso) : null},
        ${userData.genero === "true"},
        ${Number.parseInt(userData.piel)},
        false
      ) RETURNING id_usuario
    `

    if (result.length > 0) {
      // Set session cookie
      const cookieStore = await cookies()
      cookieStore.set("user_id", result[0].id_usuario.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return { success: true, userId: result[0].id_usuario }
    }

    return { success: false, error: "Error al crear usuario" }
  } catch (error) {
    console.error("Register error:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function loginUser(userData: {
  email: string
  contrasena: string
}) {
  try {
    // Find user
    const users = await sql`
      SELECT id_usuario, contrasena FROM usuarios WHERE email = ${userData.email}
    `

    if (users.length === 0) {
      return { success: false, error: "Email o contraseña incorrectos" }
    }

    const user = users[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(userData.contrasena, user.contrasena)

    if (!isValidPassword) {
      return { success: false, error: "Email o contraseña incorrectos" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("user_id", user.id_usuario.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true, userId: user.id_usuario }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Error interno del servidor" }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return null
    }

    const users = await sql`
      SELECT u.*, p.nombre as piel_nombre 
      FROM usuarios u
      LEFT JOIN pieles p ON u.pieles_id_piel = p.id_piel
      WHERE u.id_usuario = ${Number.parseInt(userId)}
    `

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
