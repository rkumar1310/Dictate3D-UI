import React from 'react'
import { Layout } from '../src/components/dom/Layout'
import './global.css'
import Script from 'next/script'

export const metadata = {
  title: 'Dictate3D - AI 3D editor',
  description: 'AI 3D editor that understands and applies your english commands.',
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <Layout>{children}</Layout>
        <Script src='https://www.googletagmanager.com/gtag/js?id=G-X7CMVH7YYV' strategy='afterInteractive' />
        <Script id='google-analytics' strategy='afterInteractive'>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'G-X7CMVH7YYV');
        `}
        </Script>
      </body>
    </html>
  )
}
