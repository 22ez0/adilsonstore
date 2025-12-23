import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Star, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { useFeedbacks } from "@/hooks/use-feedbacks";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: feedbacks } = useFeedbacks();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "Todos", color: "bg-blue-600" },
    { id: "iphone", label: "iPhones", color: "bg-gray-600" },
    { id: "samsung", label: "Samsung", color: "bg-green-600" },
  ];

  const filteredProducts = selectedCategory && selectedCategory !== "all" 
    ? products?.filter(p => p.category === selectedCategory) 
    : products;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Simplified */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800 py-12 lg:py-20">
          <div className="container relative mx-auto px-4 z-10">
            <div className="space-y-8 text-center">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
                Os Melhores Celulares <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-blue-100">
                  Do Mercado
                </span>
              </h1>
              
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Qualidade garantida, entrega em até 1 hora, parcelamento em Pix. 
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`px-6 h-10 transition-all ${
                      selectedCategory === cat.id || (selectedCategory === null && cat.id === "all")
                        ? `${cat.color} text-white shadow-lg`
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                    data-testid={`category-${cat.id}`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-white max-w-md mx-auto pt-4">
                <div>
                  <p className="text-2xl font-bold">5k+</p>
                  <p className="text-sm text-blue-100">Vendas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">1h</p>
                  <p className="text-sm text-blue-100">Entrega</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-blue-100">Avaliação</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Garantia Garantida</h3>
                  <p className="text-sm text-muted-foreground">Todos produtos originais</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Entrega Expressa</h3>
                  <p className="text-sm text-muted-foreground">Envio imediato após pagamento</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Parcelamento Pix</h3>
                  <p className="text-sm text-muted-foreground">Em até 5x sem juros</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="products" className="py-16 container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
              {selectedCategory === "iphone" ? "iPhones Disponíveis" : selectedCategory === "samsung" ? "Samsung Disponíveis" : "Todos os Produtos"}
            </h2>
            <p className="text-muted-foreground">Qualidade premium com melhor preço.</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-slate-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">O que nossos clientes dizem</h2>
            
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                {feedbacks?.map((feedback) => (
                  <CarouselItem key={feedback.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="border-none shadow-sm">
                        <CardContent className="flex flex-col gap-4 p-6">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">"{feedback.text}"</p>
                          <div className="flex items-center gap-3 pt-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {feedback.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{feedback.name}</p>
                              <p className="text-xs text-muted-foreground">{feedback.date}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
