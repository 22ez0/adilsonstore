import { useParams } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function Category() {
  const params = useParams<{ type: string }>();
  const { data: products, isLoading } = useProducts();

  const categoryType = params.type?.toLowerCase();
  const categoryTitle = categoryType === "iphone" ? "iPhones" : categoryType === "samsung" ? "Samsung" : "Produtos";

  const filteredProducts = products?.filter(p => p.category === categoryType) || [];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-display font-bold text-slate-900 mb-4">
            {categoryTitle} Disponíveis
          </h1>
          <p className="text-lg text-slate-600">
            {filteredProducts.length} produtos encontrados • Todos com capinha, carregador e garantia
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-slate-600">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
