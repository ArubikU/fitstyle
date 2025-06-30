"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shirt, ArrowLeft } from "lucide-react"
import { registerUser } from "../actions/auth"
import { SkinToneSelector } from "@/components/skin-tone-selector"
import { ColorRecommendations } from "@/components/color-recommendations"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    contrasena: "",
    altura: "",
    peso: "",
    genero: "",
    piel: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await registerUser(formData)
      if (result.success) {
        router.push("/dashboard")
      } else {
        alert(result.error || "Error al registrar usuario")
      }
    } catch (error) {
      alert("Error al registrar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            <CardTitle className="text-lg sm:text-xl">Crear Cuenta</CardTitle>
            <CardDescription className="text-sm sm:text-base px-2">
              Completa tu perfil para recibir recomendaciones personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  Nombre Completo
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  required
                  className="h-11 text-base"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                  onChange={(e) => handleInputChange("contrasena", e.target.value)}
                  required
                  className="h-11 text-base"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="altura" className="text-sm font-medium">
                    Altura (cm)
                  </Label>
                  <Input
                    id="altura"
                    type="number"
                    value={formData.altura}
                    onChange={(e) => handleInputChange("altura", e.target.value)}
                    placeholder="170"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peso" className="text-sm font-medium">
                    Peso (kg)
                  </Label>
                  <Input
                    id="peso"
                    type="number"
                    value={formData.peso}
                    onChange={(e) => handleInputChange("peso", e.target.value)}
                    placeholder="70"
                    className="h-11 text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Género</Label>
                <RadioGroup
                  value={formData.genero}
                  onValueChange={(value) => handleInputChange("genero", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="true" id="masculino" />
                    <Label htmlFor="masculino" className="flex-1 cursor-pointer text-sm">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="false" id="femenino" />
                    <Label htmlFor="femenino" className="flex-1 cursor-pointer text-sm">
                      Femenino
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <SkinToneSelector
                value={formData.piel}
                onValueChange={(value) => handleInputChange("piel", value)}
                showPreview={true}
              />

              {formData.piel && <ColorRecommendations skinToneId={formData.piel} />}

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-purple-600 hover:underline font-medium">
                  Iniciar Sesión
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
