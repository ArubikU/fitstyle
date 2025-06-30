"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ColorRecommendation {
  name: string
  hsl: string
  description: string
}

const colorRecommendationsBySkinTone: Record<string, ColorRecommendation[]> = {
  "1": [
    // Blanco
    { name: "Azul", hsl: "hsl(240, 100%, 50%)", description: "Resalta tu tono natural" },
    { name: "Verde", hsl: "hsl(120, 100%, 50%)", description: "Complementa perfectamente" },
    { name: "Morado", hsl: "hsl(280, 50%, 50%)", description: "Elegante y sofisticado" },
    { name: "Pure Ruby", hsl: "hsl(350, 60%, 50%)", description: "Vibrante y llamativo" },
  ],
  "2": [
    // Trigueño
    { name: "Beige", hsl: "hsl(60, 20%, 80%)", description: "Armoniza con tu piel" },
    { name: "Wonder Beige", hsl: "hsl(60, 10%, 80%)", description: "Tono neutro perfecto" },
    { name: "Cream White", hsl: "hsl(45, 100%, 90%)", description: "Suave y elegante" },
    { name: "Marrón", hsl: "hsl(30, 60%, 25%)", description: "Complemento natural" },
  ],
  "3": [
    // Moreno
    { name: "Blanco", hsl: "hsl(0, 0%, 100%)", description: "Contraste perfecto" },
    { name: "Cream White", hsl: "hsl(45, 100%, 90%)", description: "Suaviza tu look" },
    { name: "Preloved Teal", hsl: "hsl(180, 25%, 50%)", description: "Moderno y fresco" },
    { name: "Pure Ruby", hsl: "hsl(350, 60%, 50%)", description: "Dramático y elegante" },
  ],
  "4": [
    // Negro
    { name: "Blanco", hsl: "hsl(0, 0%, 100%)", description: "Clásico atemporal" },
    { name: "Cream White", hsl: "hsl(45, 100%, 90%)", description: "Sofisticado" },
    { name: "Wonder Beige", hsl: "hsl(60, 10%, 80%)", description: "Neutro elegante" },
    { name: "Pure Ruby", hsl: "hsl(350, 60%, 50%)", description: "Impactante y poderoso" },
  ],
}

interface ColorRecommendationsProps {
  skinToneId: string
}

export function ColorRecommendations({ skinToneId }: ColorRecommendationsProps) {
  const recommendations = colorRecommendationsBySkinTone[skinToneId] || []

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Colores Recomendados</CardTitle>
        <CardDescription>Estos colores complementan perfectamente tu tono de piel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map((color, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color.hsl }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{color.name}</div>
                <div className="text-xs text-gray-500">{color.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
