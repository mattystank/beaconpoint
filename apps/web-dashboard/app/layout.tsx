import React from 'react';
import ThemeProviderClient from './ThemeProviderClient';
import Navigation from './navigation';
import GradientLayout from './GradientLayout';

export const metadata = {
  title: 'Beacon Point',
  description: 'Digital Signage Marketplace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProviderClient>
          <GradientLayout>
            <Navigation />
            {children}
          </GradientLayout>
        </ThemeProviderClient>
      </body>
    </html>
  );
}
