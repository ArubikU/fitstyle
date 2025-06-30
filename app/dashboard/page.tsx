"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shirt, RefreshCw, Heart, ShoppingBag, User, LogOut, Star, Eye } from "lucide-react"
import { getOutfitRecommendations, saveOutfitAsFavorite, getFavoriteOutfits } from "../actions/outfits"
import { ProductDetailCard } from "@/components/product-detail-card"
import { SaveOutfitModal } from "@/components/save-outfit-modal"
import { FavoriteOutfitDetailModal } from "@/components/favorite-outfit-detail-modal"
import { MobileFiltersDialog } from "@/components/mobile-filters-dialog"

interface DetailedOutfit {
  outfit_id: number
  prenda_superior_id: number
  prenda_superior_nombre: string
  prenda_superior_descripcion?: string
  prenda_superior_precio: number
  prenda_superior_material?: string
  prenda_superior_url?: string
  prenda_superior_imagen?: string
  prenda_superior_color_nombre: string
  prenda_superior_color_hsl: string
  prenda_superior_marca: string
  prenda_inferior_id: number
  prenda_inferior_nombre: string
  prenda_inferior_descripcion?: string
  prenda_inferior_precio: number
  prenda_inferior_material?: string
  prenda_inferior_url?: string
  prenda_inferior_imagen?: string
  prenda_inferior_color_nombre: string
  prenda_inferior_color_hsl: string
  prenda_inferior_marca: string
  precio_total: number
  compatibilidad_color: number
  razones_recomendacion: string[]
  puntuacion: number
}

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

export default function DashboardPage() {
  const [outfits, setOutfits] = useState<DetailedOutfit[]>([])
  const [favorites, setFavorites] = useState<FavoriteOutfit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedOcasion, setSelectedOcasion] = useState<string>("all")
  const [selectedTemporada, setSelectedTemporada] = useState<string>("all")
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<DetailedOutfit | null>(null)
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteOutfit | null>(null)

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      const result = await getOutfitRecommendations({
        ocasion: selectedOcasion === "all" ? undefined : selectedOcasion,
        temporada: selectedTemporada === "all" ? undefined : selectedTemporada,
      })
      if (result.success) {
        setOutfits(result.data || [])
      } else {
        console.error("Error loading recommendations:", result.error)
      }
    } catch (error) {
      console.error("Error loading recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFavorites = async () => {
    try {
      const result = await getFavoriteOutfits()
      if (result.success) {
        setFavorites(result.data || [])
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
  }

  const handleSaveOutfit = (outfit: DetailedOutfit) => {
    setSelectedOutfit(outfit)
    setSaveModalOpen(true)
  }

  const handleViewFavorite = (favorite: FavoriteOutfit) => {
    setSelectedFavorite(favorite)
    setDetailModalOpen(true)
  }

  const handleSaveFavorite = async (data: { comentario: string; estrellas: number }) => {
    if (!selectedOutfit) return

    setIsSaving(true)
    try {
      const result = await saveOutfitAsFavorite({
        outfitId: selectedOutfit.outfit_id,
        prendaSuperiorId: selectedOutfit.prenda_superior_id,
        prendaInferiorId: selectedOutfit.prenda_inferior_id,
        comentario: data.comentario,
        estrellas: data.estrellas,
      })

      if (result.success) {
        await loadFavorites()
        alert("¡Outfit guardado en favoritos!")
      } else {
        alert(result.error || "Error al guardar outfit")
      }
    } catch (error) {
      alert("Error al guardar outfit")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
    loadFavorites()
  }, [])

  // Actualizar recomendaciones cuando cambien los filtros en desktop
  useEffect(() => {
    loadRecommendations()
  }, [selectedOcasion, selectedTemporada])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shirt className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">FitStyle</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="recommendations" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-11">
            <TabsTrigger value="recommendations" className="text-sm">
              Recomendaciones
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-sm">
              Mis Favoritos ({favorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4 sm:space-y-6">
            {/* Mobile Filters */}
            <div className="sm:hidden">
              <MobileFiltersDialog
                selectedOcasion={selectedOcasion}
                selectedTemporada={selectedTemporada}
                onOcasionChange={setSelectedOcasion}
                onTemporadaChange={setSelectedTemporada}
                onApplyFilters={loadRecommendations}
                isLoading={isLoading}
              />
            </div>

            {/* Desktop Filters */}
            <Card className="hidden sm:block">
              <CardHeader>
                <CardTitle>Personaliza tus Recomendaciones</CardTitle>
                <CardDescription>Filtra por ocasión y temporada para obtener outfits más específicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ocasión</label>
                    <Select value={selectedOcasion} onValueChange={setSelectedOcasion}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Cualquiera</SelectItem>
                        <SelectItem value="1">Casual</SelectItem>
                        <SelectItem value="2">Deporte</SelectItem>
                        <SelectItem value="3">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temporada</label>
                    <Select value={selectedTemporada} onValueChange={setSelectedTemporada}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Cualquiera" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Cualquiera</SelectItem>
                        <SelectItem value="1">Invierno</SelectItem>
                        <SelectItem value="2">Verano</SelectItem>
                        <SelectItem value="3">Otoño</SelectItem>
                        <SelectItem value="4">Primavera</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={loadRecommendations} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                    {isLoading ? "Cargando..." : "Actualizar"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Outfits Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {outfits.map((outfit) => (
                <Card key={outfit.outfit_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base sm:text-lg">Outfit #{outfit.outfit_id}</CardTitle>
                      <Badge variant="secondary" className="text-sm sm:text-base font-semibold shrink-0">
                        S/. {outfit.precio_total}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.round(outfit.compatibilidad_color)}% compatibilidad
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(outfit.puntuacion)} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {/* Productos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ProductDetailCard
                        id={outfit.prenda_superior_id}
                        nombre={outfit.prenda_superior_nombre}
                        descripcion={outfit.prenda_superior_descripcion}
                        precio={outfit.prenda_superior_precio}
                        material={outfit.prenda_superior_material}
                        url={outfit.prenda_superior_url}
                        urlImagen={outfit.prenda_superior_imagen}
                        colorNombre={outfit.prenda_superior_color_nombre}
                        colorHsl={outfit.prenda_superior_color_hsl}
                        marcaNombre={outfit.prenda_superior_marca}
                        tipo="superior"
                      />
                      <ProductDetailCard
                        id={outfit.prenda_inferior_id}
                        nombre={outfit.prenda_inferior_nombre}
                        descripcion={outfit.prenda_inferior_descripcion}
                        precio={outfit.prenda_inferior_precio}
                        material={outfit.prenda_inferior_material}
                        url={outfit.prenda_inferior_url}
                        urlImagen={outfit.prenda_inferior_imagen}
                        colorNombre={outfit.prenda_inferior_color_nombre}
                        colorHsl={outfit.prenda_inferior_color_hsl}
                        marcaNombre={outfit.prenda_inferior_marca}
                        tipo="inferior"
                      />
                    </div>

                    {/* Razones de recomendación */}
                    {outfit.razones_recomendacion && outfit.razones_recomendacion.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <h4 className="text-sm font-medium text-gray-700">¿Por qué te recomendamos esto?</h4>
                        <ul className="space-y-1">
                          {outfit.razones_recomendacion.map((razon, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start space-x-2">
                              <span className="text-purple-500 mt-0.5 shrink-0">•</span>
                              <span>{razon}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                      <Button size="sm" className="flex-1 h-10" onClick={() => handleSaveOutfit(outfit)}>
                        <Heart className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-10 bg-transparent"
                        onClick={() => {
                          if (outfit.prenda_superior_url) window.open(outfit.prenda_superior_url, "_blank")
                        }}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {outfits.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Shirt className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay outfits disponibles</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                  Intenta ajustar los filtros o actualizar las recomendaciones
                </p>
                <Button onClick={loadRecommendations} className="h-11">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cargar Recomendaciones
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favorites.map((favorite) => (
                <Card key={favorite.id_outfit} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base sm:text-lg line-clamp-1">{favorite.outfit_nombre}</CardTitle>
                      <div className="flex items-center space-x-1 shrink-0">
                        {Array.from({ length: favorite.estrellas }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <CardDescription className="text-xs sm:text-sm">
                      Guardado el {new Date(favorite.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    {favorite.comentario && (
                      <div className="text-xs sm:text-sm text-gray-600 italic line-clamp-2">
                        "{favorite.comentario}"
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {favorite.prendas.slice(0, 2).map((prenda) => (
                        <div key={prenda.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                          <div
                            className="w-4 h-4 rounded-full border shrink-0"
                            style={{ backgroundColor: prenda.color_hsl }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{prenda.nombre}</div>
                            <div className="text-xs text-gray-500">S/. {prenda.precio}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-9 bg-transparent"
                      onClick={() => handleViewFavorite(favorite)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {favorites.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No tienes outfits favoritos</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">
                  Guarda tus outfits favoritos desde las recomendaciones
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Save Outfit Modal */}
      <SaveOutfitModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={handleSaveFavorite}
        outfitId={selectedOutfit?.outfit_id || 0}
        isLoading={isSaving}
      />

      {/* Favorite Detail Modal */}
      <FavoriteOutfitDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        outfit={selectedFavorite}
      />
    </div>
  )
}
