import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdLink,
} from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore } from '../../../services/firebase';
import EditProfile from '../../Modal/EditProfile';

const MobileAside = ({ profile, myProfile }) => {
  const [user] = useAuthState(auth);
  const [followers, setFollowers] = useState();
  const [hasFollowed, setHasFollowed] = useState();
  const [loading, setLoading] = useState();

  const followUser = async () => {
    setLoading(true);

    if (!user) return;

    if (hasFollowed) {
      await deleteDoc(
        doc(firestore, 'users', user?.uid, 'following', profile?.uid)
      );

      await deleteDoc(
        doc(firestore, 'users', profile?.uid, 'followers', user?.uid)
      );
    } else {
      await setDoc(
        doc(firestore, 'users', user?.uid, 'following', profile?.uid),
        {
          user: profile?.user,
          uid: profile?.uid,
          createdAt: serverTimestamp(),
        }
      );

      await setDoc(
        doc(firestore, 'users', profile?.uid, 'followers', user?.uid),
        {
          user: myProfile?.user,
          uid: myProfile?.uid,
          createdAt: serverTimestamp(),
        }
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    if (followers) {
      setHasFollowed(
        followers?.findIndex((follow) => follow.id === user?.uid) !== -1
      );
    }
  }, [followers, user]);

  useEffect(
    () =>
      onSnapshot(
        query(collection(firestore, 'users', profile.uid, 'followers')),
        (snapshot) => setFollowers(snapshot.docs)
      ),
    []
  );

  return (
    <div className="flex flex-col bg-white dark:bg-neutral-900 p-4 md:hidden sm:rounded-lg">
      <div className="flex items-center w-full">
          <Image
            className="rounded-full object-cover w-24 h-20 sm:w-32 sm:h-28"
            src={profile.photoURL}
            alt={profile.displayName}
            width={200}
            height={200}
            quality={100}
          />
        <div className="flex flex-col mx-4 w-full">
          <span className="text-xs sm:text-sm">{profile.displayName}</span>
          <span className="text-lg sm:text-xl font-semibold">
            @{profile.user}
          </span>
          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
            {followers ? followers.length : '0'} seguidores
          </span>
          <span className="py-2 text-sm">{profile.bio}</span>
          {profile.social && (
            <div className="flex items-center space-x-2 overflow-x-scroll scrollbar-thin">
              {profile.social.twitter && (
                <Link href={`https://twitter.com/${profile.social.twitter}`}>
                  <IoLogoTwitter className="customProfileIcon text-[#00acee]" />
                </Link>
              )}
              {profile.social.instagram && (
                <Link
                  href={`https://instagram.com/${profile.social.instagram}`}
                >
                  <IoLogoInstagram className="customProfileIcon text-[#DD2A7B]" />
                </Link>
              )}
              {profile.social.facebook && (
                <Link href={`https://facebook.com/${profile.social.facebook}`}>
                  <IoLogoFacebook className="customProfileIcon text-[#3b5998]" />
                </Link>
              )}
              {profile.social.others && (
                <Link href={`https://${profile.social.others}`}>
                  <IoMdLink className="customProfileIcon" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      {profile.user === myProfile?.user ? (
        <div className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-6 py-1 w-full rounded-lg transition mt-2 text-center">
          <EditProfile title="Editar perfil" perfil={myProfile} />
        </div>
      ) : (
        <button
          onClick={followUser}
          disabled={!user}
          className={`flex justify-center items-center mt-2 ${
            hasFollowed
              ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
              : 'bg-transparent border border-blue-500 text-blue-500'
          } text-white rounded-lg transition px-6 py-1`}
        >
          {loading ? (
            <VscLoading className="h-6 w-6 animate-spin" />
          ) : (
            <>{hasFollowed ? 'Seguindo' : 'Seguir'}</>
          )}
        </button>
      )}
    </div>
  );
};

export default MobileAside;
