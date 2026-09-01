import type { ReactNode } from 'react';
import { CamadaBeacon } from '@camada/next';

export const metadata = {
  title: 'camada-next-example',
  description: 'Example Next.js app running @camada/next',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <CamadaBeacon />
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: '2rem auto', maxWidth: 640 }}>
        {children}
      </body>
    </html>
  );
}
