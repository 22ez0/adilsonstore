import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Trash2, Plus, Minus } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground">Adicione produtos para começar suas compras</p>
            <Button onClick={() => setLocation("/")} size="lg">
              Voltar à Loja
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalPrice / 100);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Carrinho de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.product.id} className="p-6 flex gap-6">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.product.name}</h3>
                  <p className="text-muted-foreground text-sm">{item.product.storage}</p>
                  <p className="font-semibold mt-2">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(item.product.price / 100)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2 border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.product.id)}
                    data-testid="button-remove-item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-4">
              <h2 className="text-xl font-bold">Resumo do Pedido</h2>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formattedTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span className="text-green-600">Grátis</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total:</span>
                  <span>{formattedTotal}</span>
                </div>

                <Button
                  className="w-full mb-2"
                  onClick={() => setLocation("/checkout")}
                  data-testid="button-checkout"
                >
                  Ir para Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full mb-2"
                  onClick={() => setLocation("/")}
                  data-testid="button-continue-shopping"
                >
                  Continuar Comprando
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive"
                  onClick={clearCart}
                  data-testid="button-clear-cart"
                >
                  Limpar Carrinho
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
