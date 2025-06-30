"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Server } from "lucide-react"

interface DatabaseSelectorProps {
  currentDb: "neon" | "sqlserver"
  onDbChange: (db: "neon" | "sqlserver") => void
}

export function DatabaseSelector({ currentDb, onDbChange }: DatabaseSelectorProps) {
  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Base de Datos:</span>

      <Button
        size="sm"
        variant={currentDb === "neon" ? "default" : "outline"}
        onClick={() => onDbChange("neon")}
        className="h-8"
      >
        <Database className="h-3 w-3 mr-1" />
        Neon
        {currentDb === "neon" && (
          <Badge variant="secondary" className="ml-1 text-xs">
            Activa
          </Badge>
        )}
      </Button>

      <Button
        size="sm"
        variant={currentDb === "sqlserver" ? "default" : "outline"}
        onClick={() => onDbChange("sqlserver")}
        className="h-8"
      >
        <Server className="h-3 w-3 mr-1" />
        SQL Server
        {currentDb === "sqlserver" && (
          <Badge variant="secondary" className="ml-1 text-xs">
            Activa
          </Badge>
        )}
      </Button>
    </div>
  )
}
