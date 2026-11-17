import { IBM_Plex_Sans } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const fonte = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--fonte-plex",
});

export const metadata = { title: "Análise da rede Wi-Fi" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={fonte.variable}>
      <body>
        <Nav />
        <main className="miolo principal">{children}</main>
      </body>
    </html>
  );
}
