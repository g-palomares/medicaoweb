"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/", texto: "Medições" },
  { href: "/graficos", texto: "Gráfico" },
  { href: "/mapa-de-calor", texto: "Mapa de calor" },
];

export default function Nav() {
  const atual = usePathname();
  return (
    <header className="barra">
      <div className="miolo barra-conteudo">
        <Link href="/" className="marca">Análise da rede Wi-Fi</Link>
        <nav className="abas" aria-label="Seções">
          {ABAS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="aba"
              aria-current={atual === a.href ? "page" : undefined}
            >
              {a.texto}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
