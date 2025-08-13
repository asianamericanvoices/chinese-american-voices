// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Chinese American Voices | 华裔美国人之声',
  description: 'Independent journalism focused on stories that matter to the Chinese American community. Get the latest news on politics, healthcare, education, and immigration.',
  keywords: 'Chinese American, Asian American, news, politics, healthcare, education, immigration, community',
  openGraph: {
    title: 'Chinese American Voices',
    description: 'Independent journalism for the Chinese American community',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'zh_CN',
    siteName: 'Chinese American Voices'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chinese American Voices',
    description: 'Independent journalism for the Chinese American community'
  },
  alternates: {
    languages: {
      'en': '/en',
      'zh': '/zh'
    }
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+SC:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#dc2626" />
      </head>
      <body className="bg-white font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
