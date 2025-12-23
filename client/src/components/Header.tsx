import { Link, useLocation } from "wouter";
import { Smartphone, ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { label: "Início", href: "/" },
    { label: "iPhones", href: "/category/iphone" },
    { label: "Samsung", href: "/category/samsung" },
    { label: "Garantia", href: "/warranty" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-primary hover:opacity-90 transition-opacity">
          <Smartphone className="w-8 h-8" />
          <span className="bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
            Adilson Store
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href) ? "text-primary font-bold" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/cart">
            <Button size="sm" className="gap-2" data-testid="button-cart-header">
              <ShoppingBag className="w-4 h-4" />
              <span>Carrinho ({totalItems})</span>
            </Button>
          </Link>
        </nav>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-10">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium ${
                      isActive(item.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  <Button className="w-full gap-2 mt-4" data-testid="button-cart-mobile">
                    <ShoppingBag className="w-4 h-4" />
                    Ver Carrinho ({totalItems})
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
