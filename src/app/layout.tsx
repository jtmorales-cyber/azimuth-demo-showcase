import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '500', '600'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // iPad safe area coverage — extends under notch/dynamic island
  viewportFit: 'cover',
  // Match dark theme immediately on initial paint
  themeColor: '#0A0E1A',
};

export const metadata: Metadata = {
  title: 'Azimuth Mission Mentor — Interactive Demo',
  description:
    'AI-powered veteran career lifecycle platform. One platform. Complete coverage. AI that serves those who served.',
  // Kiosk-specific meta tags
  other: {
    // Allow PWA fullscreen on iOS home screen
    'apple-mobile-web-app-capable': 'yes',
    // Status bar matches dark background
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    // Prevent iOS from auto-linking phone numbers, addresses, emails
    'format-detection': 'telephone=no, date=no, address=no, email=no',
    // Title shown when added to iOS home screen
    'apple-mobile-web-app-title': 'Azimuth',
    // Android fullscreen hint
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-inter bg-deep-navy text-silver antialiased">
        {children}
      </body>
    </html>
  );
}
