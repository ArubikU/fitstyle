"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Star, ShoppingBag, Calendar, ExternalLink, Palette } from "lucide-react"
import Image from "next/image"

interface FavoriteOutfit {
  id_outfit: number
  outfit_nombre: string
  created_at: string
  comentario: string
  estrellas: number
  prendas: Array<{
    id: number
    nombre: string
    precio: number
    url_imagen?: string
    color_nombre: string
    color_hsl: string
    descripcion?: string
    material?: string
    url?: string
    marca_nombre?: string
    tipo_nombre?: string
  }>
}

interface FavoriteOutfitDetailModalProps {
  isOpen: boolean
  onClose: () => void
  outfit: FavoriteOutfit | null
}

export function FavoriteOutfitDetailModal({ isOpen, onClose, outfit }: FavoriteOutfitDetailModalProps) {
  if (!outfit) return null

  const precioTotal = outfit.prendas.reduce((total, prenda) => total + prenda.precio, 0)
  const prendaSuperior = outfit.prendas.find(
    (p) =>
      p.tipo_nombre?.toLowerCase().includes("polera") ||
      p.tipo_nombre?.toLowerCase().includes("camisa") ||
      p.tipo_nombre?.toLowerCase().includes("blusa") ||
      p.tipo_nombre?.toLowerCase().includes("casaca"),
  )
  const prendaInferior = outfit.prendas.find(
    (p) =>
      p.tipo_nombre?.toLowerCase().includes("pantalon") ||
      p.tipo_nombre?.toLowerCase().includes("falda") ||
      p.tipo_nombre?.toLowerCase().includes("bermuda") ||
      p.tipo_nombre?.toLowerCase().includes("jogger"),
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left pb-4">
          <DialogTitle className="flex items-center justify-between text-lg sm:text-xl">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500" />
              <span>{outfit.outfit_nombre}</span>
            </div>
            <Badge variant="secondary" className="text-sm font-semibold">
              S/. {precioTotal.toFixed(2)}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                Guardado el{" "}
                {new Date(outfit.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: outfit.estrellas }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1 text-sm">({outfit.estrellas}/5)</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comentario del usuario */}
          {outfit.comentario && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tu Opinión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 italic">"{outfit.comentario}"</p>
              </CardContent>
            </Card>
          )}

          {/* Prendas del outfit */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Prendas del Outfit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outfit.prendas.map((prenda) => (
                <Card key={prenda.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium line-clamp-2">{prenda.nombre}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {prenda.marca_nombre} • {prenda.tipo_nombre}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        S/. {prenda.precio}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Imagen del producto */}
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {prenda.url_imagen ? (
                        <Image
                          src={prenda.url_imagen || "/placeholder.svg"}
                          alt={prenda.nombre}
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
                          <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                          <span className="text-xs">Sin imagen</span>
                        </div>
                      </div>
                    </div>

                    {/* Detalles del producto */}
                    <div className="space-y-2">
                      {/* Color */}
                      <div className="flex items-center space-x-2">
                        <Palette className="h-4 w-4 text-gray-500 shrink-0" />
                        <div className="flex items-center space-x-2 min-w-0">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: prenda.color_hsl }}
                          />
                          <span className="text-sm font-medium truncate">{prenda.color_nombre}</span>
                        </div>
                      </div>

                      {/* Material */}
                      {prenda.material && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Material:</span> {prenda.material}
                        </div>
                      )}

                      {/* Descripción */}
                      {prenda.descripcion && (
                        <div className="text-xs text-gray-600 line-clamp-2">
                          <span className="font-medium">Descripción:</span> {prenda.descripcion}
                        </div>
                      )}
                    </div>

                    {/* Botón de compra */}
                    {prenda.url && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-9 text-xs bg-transparent"
                        onClick={() => window.open(prenda.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ver Producto
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Resumen del outfit */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen del Outfit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Precio Total:</span>
                  <div className="text-lg font-bold text-purple-600">S/. {precioTotal.toFixed(2)}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tu Calificación:</span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: outfit.estrellas }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm font-medium">({outfit.estrellas}/5)</span>
                  </div>
                </div>
              </div>

              {/* Combinación de colores */}
              <div>
                <span className="font-medium text-gray-700 text-sm">Combinación de Colores:</span>
                <div className="flex items-center space-x-2 mt-1">
                  {outfit.prendas.map((prenda, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: prenda.color_hsl }}
                      />
                      <span className="text-xs text-gray-600">{prenda.color_nombre}</span>
                      {index < outfit.prendas.length - 1 && <span className="text-gray-400 mx-1">+</span>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-11 bg-transparent"
              onClick={() => {
                // Abrir la primera prenda disponible
                const prendaConUrl = outfit.prendas.find((p) => p.url)
                if (prendaConUrl?.url) {
                  window.open(prendaConUrl.url, "_blank")
                }
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Comprar Outfit
            </Button>
            <Button onClick={onClose} className="flex-1 h-11">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
