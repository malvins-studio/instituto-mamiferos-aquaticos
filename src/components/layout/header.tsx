import Image from "next/image";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm z-50 flex flex-col items-center p-4 border-b">
      <Image
        src="/ima-logo.png"
        alt="Logo do Projeto"
        width={250}
        height={100}
        className="h-24 w-auto mb-2"
      />

      <h1 className="text-2xl font-semibold text-foreground">
        Formulário de Registro
      </h1>
    </header>
  );
};

export default Header;
