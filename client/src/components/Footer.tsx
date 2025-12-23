import { Link } from "wouter";
import { Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-display font-bold text-2xl">
              <Smartphone className="w-8 h-8 text-blue-500" />
              <span>Adilson Store</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sua loja confiável para iPhones e Samsungs. Garantia de qualidade, 
              entrega rápida e os melhores preços do mercado brasileiro.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">Navegação</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link href="/#products" className="hover:text-white transition-colors">Produtos</Link></li>
              <li><Link href="/#testimonials" className="hover:text-white transition-colors">Depoimentos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6">Categorias</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/category/iphone" className="hover:text-white transition-colors">Apple iPhone</Link></li>
              <li><Link href="/category/samsung" className="hover:text-white transition-colors">Samsung Galaxy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-16 pt-8 text-center text-slate-500 text-sm">
          <p>© 2025 Adilson Store. Todos os direitos reservados. CNPJ: 52.630.137/0001-23</p>
        </div>
      </div>
    </footer>
  );
}
