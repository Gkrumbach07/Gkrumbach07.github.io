import React from 'react'

import type { AppProps } from 'next/app'
import Head from 'next/head'

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'

import { Theme } from '../components/Theme'
import AlertProvider from '../components/AlertProvider'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App({ Component, pageProps }: AppProps<{
  initialSession: Session,
}>) {
  const [supabase] = React.useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <Head>
        <title>Gage Krumbach</title>
        <meta name="description" content="Gage Krumbach" />
        <link rel="icon" href="assets/gage_krumbach.jpg" />
      </Head>
      <Theme>
        <AlertProvider>
          <Component {...pageProps} />
        </AlertProvider>
      </Theme>
    </SessionContextProvider>
  )
}
