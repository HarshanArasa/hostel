import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HostelOps — Complaint Management',
  description: 'Modern Hostel Complaint & Maintenance Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        {children}
        {/* Toast notification system */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#a78bfa', secondary: '#1e293b' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1e293b' },
            },
          }}
        />
      </body>
    </html>
  );
}
