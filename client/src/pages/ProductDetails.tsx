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

  // Preço 51% mais barato (30% + 30% = 49% do preço original)
  const discountedPrice = Math.floor(product.price * 0.49);
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

            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-blue-300 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full -mr-8 -mt-8"></div>
              
              <p className="text-sm text-slate-500 line-through mb-1">
                De {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
              </p>
              <div className="flex items-end gap-2 mb-6 relative z-10">
                <span className="text-6xl font-bold bg-gradient-to-r from-red-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">{formattedPrice}</span>
                <span className="text-sm font-bold text-green-600 mb-2 bg-green-100 px-3 py-1 rounded-full">À VISTA</span>
              </div>
              
              <div className="space-y-3 pt-6 border-t border-blue-300 relative z-10">
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-gradient-to-r from-blue-50 to-transparent p-3 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span>Parcele em até <strong className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">5x de {formattedInstallment}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-gradient-to-r from-green-50 to-transparent p-3 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span><strong>ENTREGA EM ATÉ 2 HORAS</strong> após 1º pagamento</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 font-medium bg-gradient-to-r from-purple-50 to-transparent p-3 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span><strong>GARANTIA 12 MESES</strong> + Nota Fiscal válida</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-lg relative z-10">
                <p className="text-sm font-bold text-blue-900">✓ 100% INCLUSO NA COMPRA:</p>
                <p className="text-xs text-blue-800 mt-2 leading-relaxed">• Capinha protetora premium • Carregador original • Nota Fiscal eletrônica • Garantia oficial • Possibilidade de reembolso em 30 dias</p>
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
