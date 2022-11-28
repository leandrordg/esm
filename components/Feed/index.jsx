import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { RiArrowRightSLine } from 'react-icons/ri';
import { auth, firestore } from '../../services/firebase';
import PostForm from '../Modal/PostForm';
import Signin from '../Modal/Signin';
import SkeletonFeed from '../Skeleton/Feed';
import Aside from './Aside';
import Posts from './Posts';

const FeedContent = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState();
  const [posts, setPosts] = useState();
  const [loading, setLoading] = useState(false);
  const [value] = useCollection(
    collection(firestore, 'users'),
    where('uid', '!=', user?.uid),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  useEffect(() => {
    if (user) {
      onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        setProfile(doc.data());
      });
    } else {
      setProfile();
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);

    const unsub = onSnapshot(
      query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setPosts(snapshot);
      }
    );

    setLoading(false);

    return () => {
      unsub();
    };
  }, []);

  return (
    <>
      {profile?.wallpaperURL && (
        <Image
          className="fixed inset-0 w-full h-full object-cover -z-20"
          src={profile?.wallpaperURL}
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
        <div className="w-full max-w-3xl space-y-2">
          {loading && <SkeletonFeed />}
          {posts?.docs.length ? (
            posts.docs.map((post) => (
              <Posts post={{ id: post.id, ...post.data() }} key={post.id} />
            ))
          ) : (
            <div
              className={`flex flex-col items-center md:items-start p-4 space-y-2 ${
                profile?.wallpaperURL &&
                'bg-white dark:bg-neutral-900 sm:rounded-xl'
              }`}
            >
              <h1 className="text-lg sm:text-xl md:text-2xl">
                Ainda não existe publicação por aqui...
              </h1>
              <p className="text-xs sm:text-sm md:tex-base">
                {user
                  ? 'Que tal postar algo por enquanto?'
                  : 'Entre para publicar e interagir com as pessoas que gosta.'}
              </p>
              {user ? (
                <PostForm type="home" />
              ) : (
                <div className="text-blue-500 hover:underline text-xs sm:text-sm">
                  <Signin title="Clique aqui para entrar" />
                </div>
              )}

              {user && value && (
                <div className="py-4 w-full">
                  <span className="text-lg sm:text-xl md:text-2xl">
                    Algumas recomendações
                  </span>
                  <div className="flex flex-col space-y-2 mt-2">
                    {value.docs.map((user) => (
                      <Link
                        href={`/${user.data().user}`}
                        key={user.id}
                        className="flex items-center space-x-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-xl cursor-pointer"
                      >
                        {/* Left */}
                        <Image
                          className="rounded-full"
                          src={user.data().photoURL}
                          alt={user.data().displayName}
                          width={40}
                          height={40}
                        />
                        {/* Center */}
                        <div className="flex flex-col w-full">
                          <span className="text-sm">
                            {user.data().displayName}
                          </span>
                          <span className="text-lg">@{user.data().user}</span>
                        </div>
                        {/* Right */}
                        <RiArrowRightSLine className="h-10 w-10" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <Aside profile={profile && profile} />
      </main>
    </>
  );
};

export default FeedContent;
