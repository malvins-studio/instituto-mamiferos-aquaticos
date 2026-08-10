// src/components/layout/header.tsx
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-brand-border shadow-sm z-50">
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
        {/* Esquerda: Menu */}
        <div className="flex-1 flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            className="text-brand-primary hover:bg-brand-bg-secondary focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
          >
            <Menu className="size-6" />
          </Button>
        </div>

        {/* Centro: Logo */}
        <div className="shrink-0 flex items-center">
          <Link href="/" aria-label="Página Inicial" className="hover:opacity-75 transition-opacity">
            <Image
              src="/ima-logo.png"
              alt="Logo Instituto Mamíferos Aquáticos"
              width={200}
              height={71}
              className="h-14 w-auto md:h-16"
              priority
            />
          </Link>
        </div>

        {/* Direita: Login */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/login"
            className="text-sm font-medium text-brand-primary hover:text-brand-accent transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
