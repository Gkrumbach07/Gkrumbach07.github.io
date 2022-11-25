import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Theme } from '../components/Theme'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Gage Krumbach</title>
        <meta name="description" content="Gage Krumbach" />
        <link rel="icon" href="assets/gage_krumbach.jpg"/>
      </Head>
      <Theme>
        <Component {...pageProps} />
      </Theme>
    </>
  )
}
