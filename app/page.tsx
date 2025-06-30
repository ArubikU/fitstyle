import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shirt, Users, Sparkles, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shirt className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">FitStyle</h1>
          </div>
          <div className="hidden sm:flex space-x-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Registrarse</Button>
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="sm:hidden">
            <Link href="/register">
              <Button size="sm">Comenzar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Tu Estilo Personal, <span className="text-purple-600">Perfecto</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
            Descubre outfits personalizados basados en tu color de piel, estatura, peso y estilo personal. Nuestra IA te
            ayuda a lucir increíble todos los días.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent"
              >
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Recomendaciones IA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Algoritmos inteligentes que analizan tu perfil físico y preferencias para crear outfits perfectos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Perfil Personalizado</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Crea tu perfil con detalles como color de piel, estatura, peso y preferencias de estilo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow md:col-span-1 md:mx-auto md:max-w-sm lg:max-w-none lg:mx-0">
            <CardHeader className="pb-4">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
              <CardTitle className="text-lg sm:text-xl">Tendencias Actuales</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Mantente al día con las últimas tendencias de moda adaptadas a tu estilo personal.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">¿Listo para transformar tu estilo?</h3>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">
            Únete a miles de usuarios que ya descubrieron su estilo perfecto
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
              Crear Cuenta Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <Shirt className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-base sm:text-lg font-semibold">FitStyle</span>
          </div>
          <p className="text-sm sm:text-base text-gray-400">© 2024 FitStyle. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
