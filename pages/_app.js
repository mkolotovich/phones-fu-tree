import '../css/style.css'
import '../css/form.css'
import Head from 'next/head'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Телефоны</title>
      </Head>
      <div className="container wrapper">
        <Component {...pageProps} />
      </div>
    </>
  )
}

export default MyApp
