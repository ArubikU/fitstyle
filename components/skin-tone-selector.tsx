"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SkinTone {
  id: string
  name: string
  hsl: string
}

const skinTones: SkinTone[] = [
  { id: "1", name: "Blanco", hsl: "hsl(30, 15%, 85%)" },
  { id: "2", name: "Trigueño", hsl: "hsl(30, 30%, 70%)" },
  { id: "3", name: "Moreno", hsl: "hsl(30, 20%, 40%)" },
  { id: "4", name: "Negro", hsl: "hsl(25, 15%, 25%)" },
]

interface SkinToneSelectorProps {
  value: string
  onValueChange: (value: string) => void
  label?: string
  showPreview?: boolean
}

export function SkinToneSelector({
  value,
  onValueChange,
  label = "Tono de Piel",
  showPreview = true,
}: SkinToneSelectorProps) {
  const selectedTone = skinTones.find((tone) => tone.id === value)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona tu tono de piel">
            {selectedTone && (
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: selectedTone.hsl }}
                />
                <span>{selectedTone.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {skinTones.map((tone) => (
            <SelectItem key={tone.id} value={tone.id}>
              <div className="flex items-center space-x-3 py-1">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: tone.hsl }}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{tone.name}</span>
                  <span className="text-xs text-gray-500">{tone.hsl}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Vista previa del color seleccionado */}
      {showPreview && selectedTone && (
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
          <div
            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
            style={{ backgroundColor: selectedTone.hsl }}
          />
          <div className="flex flex-col">
            <span className="font-medium text-sm">{selectedTone.name}</span>
            <span className="text-xs text-gray-500 font-mono">{selectedTone.hsl}</span>
          </div>
        </div>
      )}
    </div>
  )
}
