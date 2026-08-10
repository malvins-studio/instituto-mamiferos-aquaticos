// src/components/layout/header.tsx
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-brand-header-bg text-brand-header-fg shadow-md z-50">
      <div className="container mx-auto px-4 h-20 md:h-24 flex items-center justify-between">
        {/* Esquerda: Menu */}
        <div className="flex-1 flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            className="text-brand-header-fg hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-header-bg"
          >
            <Menu className="size-6" />
          </Button>
        </div>

        {/* Centro: Logo + Título */}
        <div className="shrink-0 flex items-center gap-3">
          <Link href="/" aria-label="Página Inicial" className="hover:opacity-80 transition-opacity">
            <Image
              src="/ima-logo.png"
              alt="Logo Instituto Mamíferos Aquáticos"
              width={200}
              height={71}
              className="h-12 w-auto md:h-14"
              priority
            />
          </Link>
        </div>

        {/* Direita: Login */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/login"
            className="text-sm font-medium text-brand-header-fg hover:text-brand-accent transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
