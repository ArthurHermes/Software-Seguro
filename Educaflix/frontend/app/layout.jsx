import "./globals.css";

export const metadata = {
  title: "EducaFlix",
  description: "Plataforma de videos educacionais com trilhas organizadas e aprendizado continuo."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
