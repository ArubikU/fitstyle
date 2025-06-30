"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Palette, Info } from "lucide-react"
import Image from "next/image"

interface ProductDetailCardProps {
  id: number
  nombre: string
  descripcion?: string
  precio: number
  material?: string
  url?: string
  urlImagen?: string
  colorNombre: string
  colorHsl: string
  marcaNombre: string
  tipo: "superior" | "inferior"
}

export function ProductDetailCard({
  id,
  nombre,
  descripcion,
  precio,
  material,
  url,
  urlImagen,
  colorNombre,
  colorHsl,
  marcaNombre,
  tipo,
}: ProductDetailCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs sm:text-sm font-medium line-clamp-2">{nombre}</CardTitle>
            <CardDescription className="text-xs mt-1">{marcaNombre}</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            S/. {precio}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 sm:space-y-3">
        {/* Imagen del producto */}
        <div className="relative w-full h-24 sm:h-32 bg-gray-100 rounded-lg overflow-hidden">
          {urlImagen ? (
            <Image
              src={urlImagen || "/placeholder.svg"}
              alt={nombre}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                target.nextElementSibling?.classList.remove("hidden")
              }}
            />
          ) : null}
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-400">
              <Info className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2" />
              <span className="text-xs">Sin imagen</span>
            </div>
          </div>
        </div>

        {/* Color disponible */}
        <div className="flex items-center space-x-2">
          <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 shrink-0" />
          <div className="flex items-center space-x-2 min-w-0">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-300 shrink-0"
              style={{ backgroundColor: colorHsl }}
            />
            <span className="text-xs sm:text-sm font-medium truncate">{colorNombre}</span>
          </div>
        </div>

        {/* Material */}
        {material && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Material:</span> <span className="line-clamp-1">{material}</span>
          </div>
        )}

        {/* Descripción - Solo en desktop */}
        {descripcion && (
          <div className="hidden sm:block text-xs text-gray-600 line-clamp-2">
            <span className="font-medium">Descripción:</span> {descripcion}
          </div>
        )}

        {/* Botón de compra */}
        {url && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 sm:h-9 text-xs bg-transparent"
            onClick={() => window.open(url, "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1 sm:mr-2" />
            Ver Producto
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
