import { doc, getDoc } from 'firebase/firestore';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import FeedContent from '../components/Feed';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { auth, firestore } from '../services/firebase';

const Home = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const verificarUser = async () => {
    const docRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap?.data()?.user === undefined || docSnap?.data()?.user === "") {
      router.push('/verification');
    }
  };

  useEffect(() => {
    if (user) {
      verificarUser();
    }
  }, [user]);

  return (
    <>
      <Head>
        <title>ESM - Etec Social Media</title>
        <meta name="description" content="A rede social personalizável ao seu jeito e estilo." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <FeedContent />

      <Footer />
    </>
  );
};

export default Home;
