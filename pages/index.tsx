import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import FortuneGenerator from './components/FortuneGenerator'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Fortune Cookie Generator</title>
        <meta name="description" content="AI fortune cookie generator" />
        <meta name="google-site-verification" content="-GzBr54C5YX8Z-WJaFThDRCWkQiQkuKiB4XxI6c3gPo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <FortuneGenerator />
      </main>

      <footer className={styles.footer}>
        <Link href="/villain">See also: [build your own villain]</Link>
        <a
          href="/__repl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Built on
          <span className={styles.logo}>
            <Image src="/replit.svg" alt="Replit Logo" width={20} height={18} />
          </span>
          Replit
        </a>
      </footer>
    </div>
  )
}

export default Home