import dynamic from 'next/dynamic';
import Head from 'next/head';

const Home = dynamic(() => import('../app/components/home'), { ssr: false });

export default function IndexPage() {
	return (
		<>
			<Head>
				<title>Reactor - Web based DJ software using Audius</title>
				<meta name="description" content="DJ in your browser using music from Audius. No software to download: search, select and mix tracks." />
				<meta property="og:image" content="/thumbnail.jpg" />
				<meta property="og:title" content="Reactor - Web based DJ software using Audius" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Home />
		</>
	);
}
