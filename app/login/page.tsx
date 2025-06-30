"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shirt, ArrowLeft } from "lucide-react"
import { loginUser } from "../actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    contrasena: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await loginUser(formData)
      if (result.success) {
        router.push("/dashboard")
      } else {
        alert(result.error || "Error al iniciar sesión")
      }
    } catch (error) {
      alert("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <Shirt className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <span className="text-xl sm:text-2xl font-bold">FitStyle</span>
            </div>
            <CardTitle className="text-lg sm:text-xl">Iniciar Sesión</CardTitle>
            <CardDescription className="text-sm sm:text-base px-2">
              Accede a tu cuenta para ver tus outfits personalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-11 text-base"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrasena" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Input
                  id="contrasena"
                  type="password"
                  value={formData.contrasena}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contrasena: e.target.value }))}
                  required
                  className="h-11 text-base"
                  placeholder="Tu contraseña"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-purple-600 hover:underline font-medium">
                  Registrarse
                </Link>
              </p>
            </div>

            <div className="mt-4">
              <Link
                href="/"
                className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 py-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
