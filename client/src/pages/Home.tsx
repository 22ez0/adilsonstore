import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Star, ShieldCheck, Truck, CreditCard, Zap } from "lucide-react";
import { useFeedbacks } from "@/hooks/use-feedbacks";
import { useState, useEffect } from "react";
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
  const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);

  useEffect(() => {
    if (!feedbacks || feedbacks.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFeedbackIndex(prev => (prev + 1) % feedbacks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [feedbacks]);

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
        {/* Hero Section - Melhorado */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 py-16 lg:py-24">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>
          <div className="container relative mx-auto px-4 z-10">
            <div className="space-y-8 text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight">
                Os Melhores Celulares <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200">
                  Do Mercado
                </span>
              </h1>
              
              <p className="text-xl text-white max-w-2xl mx-auto font-medium">
                Qualidade garantida, capinha + carregador grátis, entrega em até 1 hora, parcelamento em Pix! 
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    className={`px-6 h-12 text-lg font-bold transition-all transform hover:scale-105 ${
                      selectedCategory === cat.id || (selectedCategory === null && cat.id === "all")
                        ? `${cat.color} text-white shadow-2xl`
                        : "bg-white/20 text-white hover:bg-white/40"
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

        {/* Testimonials - Auto Slide */}
        <section id="testimonials" className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-display font-bold text-center mb-16 text-white">O que nossos clientes dizem</h2>
            
            {feedbacks && feedbacks.length > 0 ? (
              <div className="w-full max-w-3xl mx-auto">
                <div className="relative h-80 flex items-center">
                  {feedbacks.map((feedback, idx) => (
                    <div
                      key={feedback.id}
                      className={`absolute inset-0 transition-all duration-500 transform ${
                        idx === currentFeedbackIndex
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    >
                      <Card className="h-full border-2 border-purple-400/50 bg-gradient-to-br from-slate-800 to-slate-700 shadow-2xl">
                        <CardContent className="flex flex-col gap-6 p-10 h-full justify-between">
                          <div>
                            <div className="flex gap-1 mb-4">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-5 h-5 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-600 text-slate-600"}`} 
                                />
                              ))}
                            </div>
                            <p className="text-lg text-slate-100 leading-relaxed font-medium">"{feedback.text}"</p>
                          </div>
                          <div className="flex items-center gap-4 pt-4 border-t border-slate-600">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {feedback.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-white">{feedback.name}</p>
                              <p className="text-sm text-slate-400">{feedback.date}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-8">
                  {feedbacks.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentFeedbackIndex(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        idx === currentFeedbackIndex
                          ? "bg-purple-500 w-8"
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                      data-testid={`feedback-dot-${idx}`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
