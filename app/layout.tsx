import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'UniKL Student Dashboard — Academic & Timetable Hub',
  description: 'Personal university student dashboard for timetable, GPA/CGPA results, and achievements.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash inline script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('unikl_dashboard_theme');
                  var theme = saved || 'unikl-navy';
                  document.documentElement.className = theme;
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-bg text-fg selection:bg-accent selection:text-accent-fg">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 lg:pl-72 pt-16 lg:pt-0 min-h-screen flex flex-col">
              <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
              </div>
              <footer className="py-6 px-8 border-t border-border text-center text-xs text-muted">
                <p>
                  Universiti Kuala Lumpur Student Dashboard • Made with ❤️ for Students • Local Storage Powered
                </p>
              </footer>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
