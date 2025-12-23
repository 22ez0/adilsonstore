import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Smartphone, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product, 1);
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado com sucesso.`,
    });
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
    <Card className="group overflow-hidden rounded-2xl border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid={`product-card-${product.id}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {product.featured && (
          <Badge className="absolute top-3 right-3 z-10 bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-lg font-bold">
            Destaque -30%
          </Badge>
        )}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="font-normal text-xs uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20">
            {product.category}
          </Badge>
          <div className="flex items-center text-yellow-500 text-xs font-bold gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span>4.9</span>
          </div>
        </div>
        
        <h3 className="font-display font-bold text-xl mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 h-10">
          {product.description}
        </p>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground line-through">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
            </p>
            <div className="mt-1">
              <p className="text-2xl font-bold text-red-600">
                {formattedPrice}
              </p>
              <p className="text-sm text-green-600 font-semibold">
                {formattedInstallment} 5x
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 gap-2">
        <Button 
          onClick={handleAddToCart} 
          className="flex-1 gap-2 font-semibold"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4" />
          Adicionar
        </Button>
        <Link href={`/product/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full gap-2 font-semibold">
            <Smartphone className="w-4 h-4" />
            Detalhes
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
