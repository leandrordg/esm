import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdArrowBack,
  IoMdLink,
} from 'react-icons/io';
import ProfileAside from '../components/Feed/Aside/profile';
import Posts from '../components/Feed/Posts';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SkeletonFeed from '../components/Skeleton/Feed';
import { auth, firestore } from '../services/firebase';

const UserPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [user] = useAuthState(auth);
  const [myProfile, setMyProfile] = useState();
  const [profile, setProfile] = useState();
  const [posts, loading] = useCollection(
    collection(firestore, 'posts'),
    where('user', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const fetchProfile = async () => {
    const collectionRef = collection(firestore, 'users');
    const q = query(collectionRef, where('user', '==', userId));

    const querySnapshot = await getDocs(q);
    setProfile(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
  };

  const fetchMyUser = async () => {
    const docRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    setMyProfile(docSnap.data());
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      fetchMyUser();
    }
  }, [user]);

  return (
    <>
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
          <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs">Vendo a página de:</span>
              <span className="text-2xl font-semibold leading-tight">
                @{userId}
              </span>
            </div>
            <IoMdArrowBack
              onClick={() => router.back()}
              className="customPostIcon"
            />
          </div>

          {profile && (
            <div className="flex flex-col bg-white dark:bg-neutral-900 p-4 md:hidden sm:rounded-lg">
              <div className="flex items-start w-full">
                <Image
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg"
                  src={profile[0].photoURL}
                  alt={profile[0].displayName}
                  width={200}
                  height={200}
                  quality={100}
                />
                <div className="flex flex-col mx-4 w-full overflow-x-auto">
                  <span className="text-xs sm:text-sm">
                    {profile[0].displayName}
                  </span>
                  <span className="text-lg sm:text-xl font-semibold">
                    @{profile[0].user}
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    0 seguidores
                  </span>
                  <span className="py-2 text-sm">{profile[0].bio}</span>
                  {profile[0].social && (
                    <div className="flex items-center space-x-2 overflow-x-scroll scrollbar-thin">
                      {profile[0].social.twitter && (
                        <Link
                          href={`https://twitter.com/${profile[0].social.twitter}`}
                        >
                          <IoLogoTwitter className="customProfileIcon text-[#00acee]" />
                        </Link>
                      )}
                      {profile[0].social.instagram && (
                        <Link
                          href={`https://instagram.com/${profile[0].social.instagram}`}
                        >
                          <IoLogoInstagram className="customProfileIcon text-[#DD2A7B]" />
                        </Link>
                      )}
                      {profile[0].social.facebook && (
                        <Link
                          href={`https://facebook.com/${profile[0].social.facebook}`}
                        >
                          <IoLogoFacebook className="customProfileIcon text-[#3b5998]" />
                        </Link>
                      )}
                      {profile[0].social.others && (
                        <Link href={`https://${profile[0].social.others}`}>
                          <IoMdLink className="customProfileIcon" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-6 py-1 w-full rounded-lg transition mt-2">
                Seguir
              </button>
            </div>
          )}

          {loading && <SkeletonFeed />}
          {posts &&
            posts.docs.map((post) => (
              <Posts post={{ id: post.id, ...post.data() }} key={post.id} />
            ))}
        </div>
        <ProfileAside profile={profile} />
      </main>
      <Footer />
    </>
  );
};

export default UserPage;
