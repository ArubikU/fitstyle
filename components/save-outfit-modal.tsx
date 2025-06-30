"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Heart, Star } from "lucide-react"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface SaveOutfitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { comentario: string; estrellas: number }) => Promise<void>
  outfitId: number
  isLoading?: boolean
}

export function SaveOutfitModal({ isOpen, onClose, onSave, outfitId, isLoading = false }: SaveOutfitModalProps) {
  const [comentario, setComentario] = useState("")
  const [estrellas, setEstrellas] = useState(5)
  const [isDragging, setIsDragging] = useState(false)
  const [showGlow, setShowGlow] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const currentXRef = useRef(0)
  const lastRatingRef = useRef(5)

  const { triggerHaptic } = useHapticFeedback()

  const ratingLabels = ["Terrible", "Malo", "Regular", "Bueno", "Excelente"]

  const ratingColors = [
    "from-red-100 to-red-200",
    "from-orange-100 to-orange-200",
    "from-yellow-100 to-yellow-200",
    "from-blue-100 to-blue-200",
    "from-green-100 to-green-200",
  ]

  const handleSave = async () => {
    triggerHaptic("medium")
    await onSave({
      comentario,
      estrellas,
    })
    setComentario("")
    setEstrellas(5)
    onClose()
  }

  const handleClose = () => {
    setComentario("")
    setEstrellas(5)
    onClose()
  }

  const updateRating = (newRating: number) => {
    if (newRating !== estrellas && newRating >= 1 && newRating <= 5) {
      setEstrellas(newRating)
      triggerHaptic("selection")
      setShowGlow(true)
      setTimeout(() => setShowGlow(false), 500)
    }
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
    lastRatingRef.current = estrellas
    triggerHaptic("light")
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    e.preventDefault() // Prevent scrolling
    currentXRef.current = e.touches[0].clientX
    const deltaX = currentXRef.current - startXRef.current

    // Calculate new rating based on swipe distance
    const sensitivity = 40 // pixels per star
    const deltaStars = Math.round(deltaX / sensitivity)
    const newRating = Math.max(1, Math.min(5, lastRatingRef.current + deltaStars))

    updateRating(newRating)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    triggerHaptic("light")
  }

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    lastRatingRef.current = estrellas
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    currentXRef.current = e.clientX
    const deltaX = currentXRef.current - startXRef.current

    const sensitivity = 40
    const deltaStars = Math.round(deltaX / sensitivity)
    const newRating = Math.max(1, Math.min(5, lastRatingRef.current + deltaStars))

    updateRating(newRating)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      currentXRef.current = e.clientX
      const deltaX = currentXRef.current - startXRef.current

      const sensitivity = 40
      const deltaStars = Math.round(deltaX / sensitivity)
      const newRating = Math.max(1, Math.min(5, lastRatingRef.current + deltaStars))

      updateRating(newRating)
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove)
      document.addEventListener("mouseup", handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <span>Guardar Outfit Favorito</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Guarda este outfit en tus favoritos y compártenos tu opinión
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Calificación</Label>

            {/* Mobile Star Selector */}
            <div className="sm:hidden">
              <div className="text-center mb-4">
                <div className="text-xs text-gray-500 mb-3 px-4">
                  Desliza horizontalmente para cambiar la calificación
                </div>
                <div
                  ref={containerRef}
                  className={`
                    relative bg-gradient-to-r ${ratingColors[estrellas - 1]} rounded-2xl p-6 
                    select-none cursor-grab active:cursor-grabbing no-select
                    ${isDragging ? "scale-105 shadow-lg" : "scale-100 shadow-md"}
                    transition-all duration-300 ease-out
                    border-2 border-white/50
                  `}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{ touchAction: "none" }}
                >
                  {/* Stars Display */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`
                          h-8 w-8 transition-all duration-300 ease-out
                          ${
                            i < estrellas
                              ? `fill-yellow-400 text-yellow-400 scale-110 ${showGlow ? "star-glow" : ""}`
                              : "fill-gray-300 text-gray-300 scale-95"
                          }
                        `}
                      />
                    ))}
                  </div>

                  {/* Rating Text */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-2">{estrellas}</div>
                    <div className="text-lg font-semibold text-gray-700 mb-1">{ratingLabels[estrellas - 1]}</div>
                    <div className="text-sm text-gray-600">
                      {estrellas} estrella{estrellas !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Visual indicator for dragging */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-white/30 rounded-2xl pointer-events-none backdrop-blur-sm" />
                  )}

                  {/* Swipe indicators */}
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-40">
                    <div className="flex flex-col space-y-1">
                      <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
                      <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-40">
                    <div className="flex flex-col space-y-1">
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <div className="w-1 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-3 bg-gray-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Rating dots indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`
                            w-2 h-2 rounded-full transition-all duration-200
                            ${i < estrellas ? "bg-white/80 scale-110" : "bg-white/30 scale-90"}
                          `}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Star Selector */}
            <div className="hidden sm:block">
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateRating(rating)}
                    className="flex flex-col items-center space-y-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${
                            i < rating
                              ? estrellas >= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium">{rating}</span>
                  </button>
                ))}
              </div>
              <div className="text-center mt-3">
                <span className="text-sm text-gray-600">
                  Calificación: {estrellas} estrella{estrellas !== 1 ? "s" : ""} - {ratingLabels[estrellas - 1]}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario" className="text-sm font-medium">
              Comentario (opcional)
            </Label>
            <Textarea
              id="comentario"
              placeholder="¿Qué te parece este outfit? Comparte tu opinión..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              className="text-sm resize-none min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto h-11 order-2 sm:order-1 bg-transparent"
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto h-11 order-1 sm:order-2">
            {isLoading ? "Guardando..." : "Guardar Favorito"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
