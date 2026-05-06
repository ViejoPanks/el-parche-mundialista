import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'El Parche Mundialista',
  description: 'La polla del Mundial 2026 para vivir cada partido con el parche y los colegas. ⚽🏆',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {children}
      </body>
    </html>
  );
}
