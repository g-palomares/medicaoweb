import Link from "next/link";

export const metadata = { title: "Análise da rede WiFi" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto", padding: 16 }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <Link href="/">Medições</Link>
          <Link href="/graficos">Gráfico</Link>
          <Link href="/mapa-de-calor">Mapa de calor</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
