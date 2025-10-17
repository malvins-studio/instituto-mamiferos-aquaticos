// src/components/layout/header.tsx
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-24 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm z-50 border-b">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        {/* Bloco da Esquerda: Menu Hamburger */}

        <div className="flex-1 flex justify-start">
          <Button variant="ghost" size="icon" aria-label="Abrir menu">
            <Menu className="size-8" />
          </Button>
        </div>

        {/* Bloco Central: Logo e Títulos */}
        <div className="shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Página Inicial">
              <Image
                src="/ima-logo.png"
                alt="Logo do SIIMA"
                width={200}
                height={71}
                className="h-12 w-auto md:h-16"
                priority
              />
            </Link>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-brand-dark-blue tracking-tight leading-none">
                SIIMA
              </h1>

              <p className="hidden md:block text-sm font-normal text-brand-medium-blue leading-tight">
                Sistema de Informações do Instituto Mamíferos Aquáticos
              </p>
            </div>
          </div>
        </div>

        {/* Bloco da Direita: Placeholder para Login */}
        <div className="flex-1 flex justify-end">
          <span className="text-sm text-muted-foreground">(Login)</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
