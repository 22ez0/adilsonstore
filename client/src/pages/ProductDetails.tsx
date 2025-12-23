import { useParams, useLocation } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Shield, Truck, Star, CreditCard, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

export default function ProductDetails() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: product, isLoading } = useProduct(Number(params.id));
  const { addItem } = useCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
        <Button onClick={() => setLocation("/")}>Voltar para Início</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, 1);
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado com sucesso.`,
    });
  };

  const handleBuy = () => {
    setLocation(`/checkout/${product.id}`);
  };

  // Preço 30% mais barato (70% do preço original)
  const discountedPrice = Math.floor(product.price * 0.7);
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(discountedPrice / 100);

  const installmentPrice = (discountedPrice / 100) / 5; // 5x
  const formattedInstallment = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(installmentPrice);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 lg:p-10 shadow-sm border border-slate-100">
          
          {/* Gallery */}
          <div className="space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img, idx) => (
                  <CarouselItem key={idx}>
                    <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center p-8">
                      <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-contain" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
            
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square bg-slate-50 rounded-lg p-2 border border-slate-200 cursor-pointer hover:border-primary transition-colors">
                  <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1">
                  {product.category.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>4.9</span>
                  <span className="text-slate-400 font-normal ml-1">(128 avaliações)</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-display font-bold text-slate-900 mb-4">{product.name}</h1>
              <p className="text-slate-500 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="text-sm text-slate-500 line-through mb-1">
                De {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
              </p>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold text-red-600">{formattedPrice}</span>
                <span className="text-sm font-medium text-green-600 mb-2">à vista no Pix</span>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Parcele em até <strong>5x de {formattedInstallment}</strong> no Pix</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>Entrega grátis para todo Brasil</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Garantia de 12 meses inclusa</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddToCart} size="lg" variant="outline" className="flex-1 text-lg h-14 font-bold gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrinho
              </Button>
              <Button onClick={handleBuy} size="lg" className="flex-1 text-lg h-14 font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30">
                Comprar Agora
              </Button>
            </div>

            {/* Specs */}
            <div className="pt-8">
              <h3 className="font-bold text-lg mb-4">Especificações Técnicas</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {product.specs && Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase tracking-wider">{key}</span>
                    <span className="font-medium text-slate-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
