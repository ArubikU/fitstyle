"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, RefreshCw } from "lucide-react"

interface MobileFiltersDialogProps {
  selectedOcasion: string
  selectedTemporada: string
  onOcasionChange: (value: string) => void
  onTemporadaChange: (value: string) => void
  onApplyFilters: () => void
  isLoading: boolean
}

export function MobileFiltersDialog({
  selectedOcasion,
  selectedTemporada,
  onOcasionChange,
  onTemporadaChange,
  onApplyFilters,
  isLoading,
}: MobileFiltersDialogProps) {
  const [open, setOpen] = useState(false)

  const hasActiveFilters = selectedOcasion !== "all" || selectedTemporada !== "all"

  const handleApply = () => {
    onApplyFilters()
    setOpen(false)
  }

  const handleReset = () => {
    onOcasionChange("all")
    onTemporadaChange("all")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 text-base bg-white border-2 border-gray-200 hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-3" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 text-xs bg-purple-100 text-purple-700">
              Activos
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-sm mx-auto rounded-lg">
        <DialogHeader className="text-left pb-4">
          <DialogTitle className="text-xl font-semibold">Filtros de Búsqueda</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Ocasión */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Ocasión</label>
            <Select value={selectedOcasion} onValueChange={onOcasionChange}>
              <SelectTrigger className="h-12 text-base border-2 border-gray-200 bg-white">
                <SelectValue placeholder="Selecciona una ocasión" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="all" className="h-12 text-base">
                  Cualquier ocasión
                </SelectItem>
                <SelectItem value="1" className="h-12 text-base">
                  Casual
                </SelectItem>
                <SelectItem value="2" className="h-12 text-base">
                  Deporte
                </SelectItem>
                <SelectItem value="3" className="h-12 text-base">
                  Formal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Temporada */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Temporada</label>
            <Select value={selectedTemporada} onValueChange={onTemporadaChange}>
              <SelectTrigger className="h-12 text-base border-2 border-gray-200 bg-white">
                <SelectValue placeholder="Selecciona una temporada" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="all" className="h-12 text-base">
                  Cualquier temporada
                </SelectItem>
                <SelectItem value="1" className="h-12 text-base">
                  Invierno
                </SelectItem>
                <SelectItem value="2" className="h-12 text-base">
                  Verano
                </SelectItem>
                <SelectItem value="3" className="h-12 text-base">
                  Otoño
                </SelectItem>
                <SelectItem value="4" className="h-12 text-base">
                  Primavera
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview de filtros activos */}
          {hasActiveFilters && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-800 mb-2">Filtros Activos:</h4>
              <div className="space-y-1">
                {selectedOcasion !== "all" && (
                  <div className="text-sm text-purple-700">
                    • Ocasión: {selectedOcasion === "1" ? "Casual" : selectedOcasion === "2" ? "Deporte" : "Formal"}
                  </div>
                )}
                {selectedTemporada !== "all" && (
                  <div className="text-sm text-purple-700">
                    • Temporada:{" "}
                    {selectedTemporada === "1"
                      ? "Invierno"
                      : selectedTemporada === "2"
                        ? "Verano"
                        : selectedTemporada === "3"
                          ? "Otoño"
                          : "Primavera"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-3 pt-4 border-t">
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleReset} className="h-12 text-base bg-white">
              Limpiar Filtros
            </Button>
          )}
          <Button onClick={handleApply} disabled={isLoading} className="h-12 text-base">
            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Aplicando..." : "Aplicar Filtros"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
