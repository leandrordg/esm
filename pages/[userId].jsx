import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMdArrowBack } from 'react-icons/io';
import MobileAside from '../components/Feed/Aside/mobile';
import ProfileAside from '../components/Feed/Aside/profile';
import Posts from '../components/Feed/Posts';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SkeletonFeed from '../components/Skeleton/Feed';
import { auth, firestore } from '../services/firebase';

const UserPage = ({ params }) => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [myProfile, setMyProfile] = useState();
  const [profile, setProfile] = useState();
  const [posts, setPosts] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (user) {
      onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        setMyProfile(doc.data());
      });
    } else {
      setMyProfile();
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    onSnapshot(
      query(collection(firestore, 'users'), where('user', '==', params.userId)),
      (snapshot) => setProfile(snapshot.docs.map((profile) => profile.data()))
    );
  }, [params.userId]);

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'posts'),
          where('user', '==', params.userId),
          orderBy('createdAt', 'desc')
        ),
        (snapshot) => {
          setPosts(snapshot);
        }
      ),
    [params.userId]
  );

  return (
    <>
      <Head>
        <title>ESM - @{params.userId}</title>
        <meta name="description" content="ESM - Página de Perfil do Usuário" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      {myProfile?.wallpaperURL && (
        <Image
          className="fixed inset-0 w-full h-full object-cover -z-20"
          src={myProfile?.wallpaperURL}
          alt="Carregando..."
          width={700}
          height={475}
          sizes="100vw"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )}

      <main className="flex flex-col md:flex-row max-w-7xl mx-auto md:space-y-0 md:space-x-5 lg:space-x-10 xl:space-x-20 2xl:space-x-32 sm:p-4 my-2">
        <div className="flex flex-col w-full max-w-3xl space-y-2">
          <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 sm:rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs">Vendo a página de:</span>
              <span className="text-2xl font-semibold leading-tight">
                @{router.query.userId}
              </span>
            </div>
            <IoMdArrowBack
              onClick={() => router.back()}
              className="customPostIcon"
            />
          </div>

          {profile && (
            <MobileAside profile={profile[0]} myProfile={myProfile} />
          )}

          {loading && <SkeletonFeed />}
          {posts &&
            posts.docs.map((post) => (
              <Posts post={{ id: post.id, ...post.data() }} key={post.id} />
            ))}
        </div>
        {profile && <ProfileAside profile={profile[0]} myProfile={myProfile} />}
      </main>
      <Footer />
    </>
  );
};

export default UserPage;

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};
