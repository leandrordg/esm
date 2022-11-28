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
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdLink,
} from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore } from '../../../services/firebase';
import EditLinks from '../../Modal/EditLinks';
import EditProfile from '../../Modal/EditProfile';

const ProfileAside = ({ profile, myProfile }) => {
  const [user] = useAuthState(auth);
  const [followers, setFollowers] = useState();
  const [hasFollowed, setHasFollowed] = useState();
  const [loading, setLoading] = useState();
  const [selectedImage, setSelectedImage] = useState('');
  const imageRef = useRef();

  const removeBackground = async () => {
    setLoading(true);

    const docRef = doc(firestore, 'users', user.uid);

    await updateDoc(docRef, {
      wallpaperURL: deleteField(),
    });

    setLoading(false);
  };

  const createNewBackground = async () => {
    setLoading(true);

    try {
      const docRef = doc(firestore, 'users', user.uid);

      const imageRef = ref(
        storage,
        `users/${user.uid}/wallpaper/${selectedImage.split('/')[0]}`
      );

      await uploadString(imageRef, selectedImage, 'data_url');
      const downloadURL = await getDownloadURL(imageRef);

      await updateDoc(docRef, {
        wallpaperURL: downloadURL,
      });

      setTimeout(() => {
        setSelectedImage('');
      }, 1000);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

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

  const onSelectFile = (event) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        setSelectedImage(readerEvent.target.result);
      }
    };
  };

  useEffect(
    () =>
      onSnapshot(
        query(collection(firestore, 'users', profile.uid, 'followers')),
        (snapshot) => setFollowers(snapshot.docs)
      ),
    []
  );

  useEffect(() => {
    if (followers) {
      setHasFollowed(
        followers?.findIndex((follow) => follow.id === user?.uid) !== -1
      );
    }
  }, [followers, user]);

  return (
    <>
      {profile && (
        <aside className="sticky top-20 h-fit w-full md:w-[600px] hidden md:block">
          <div className="flex flex-col space-y-4">
            <div
              className={`bg-white dark:bg-neutral-900 ${
                profile && 'pb-4'
              } shadow sm:rounded-xl overflow-hidden`}
            >
              <div className="flex flex-col relative">
                <Image
                  className="h-40 w-full object-cover mb-4"
                  src={profile?.photoURL}
                  alt={profile?.displayName}
                  width={400}
                  height={250}
                  sizes="100vw"
                  quality={100}
                />

                <div className="flex items-center justify-between w-full px-4">
                  <div>
                    <p className="text-xs">{profile?.displayName}</p>
                    <p className="text-lg font-semibold">@{profile?.user}</p>
                  </div>
                  <span className="text-sm">
                    <span className="font-semibold">
                      {followers ? followers.length : '0'}
                    </span>{' '}
                    seguidores
                  </span>
                </div>

                {profile?.bio && (
                  <div className="flex flex-wrap px-4 my-2">
                    <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                      {profile.bio}
                    </span>
                  </div>
                )}

                {profile.user === myProfile?.user ? (
                  <div className="text-blue-500 hover:underline mx-4 text-sm">
                    <EditProfile title="Editar perfil" perfil={myProfile} />
                  </div>
                ) : (
                  <button
                    onClick={followUser}
                    disabled={!user}
                    className={`flex justify-center items-center ${
                      hasFollowed
                        ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                        : 'bg-transparent border border-blue-500 text-blue-500'
                    } text-white rounded-lg transition mx-4 px-6 py-1`}
                  >
                    {loading ? (
                      <VscLoading className="h-6 w-6 animate-spin" />
                    ) : (
                      <>{hasFollowed ? 'Seguindo' : 'Seguir'}</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {profile?.social && (
              <div className="bg-white dark:bg-neutral-900 shadow p-4 sm:rounded-xl overflow-hidden">
                {profile.user === myProfile?.user && (
                  <span className="font-semibold">Meus links</span>
                )}
                <div className="flex flex-col space-y-2 my-2">
                  {profile?.social.twitter && (
                    <Link
                      href={`https://twitter.com/${profile?.social?.twitter}`}
                      className="flex items-center text-xs text-[#00acee]"
                    >
                      <IoLogoTwitter className="h-6 w-6 mr-2" />
                      <span>
                        https://twitter.com/{profile?.social?.twitter}
                      </span>
                    </Link>
                  )}
                  {profile?.social.instagram && (
                    <Link
                      href={`https://instagram.com/${profile?.social?.instagram}`}
                      className="flex items-center text-xs text-[#d12156]"
                    >
                      <IoLogoInstagram className="h-6 w-6 mr-2" />
                      <span>
                        https://instagram.com/{profile?.social?.instagram}
                      </span>
                    </Link>
                  )}
                  {profile?.social.facebook && (
                    <Link
                      href={`https://facebook.com/${profile?.social?.facebook}`}
                      className="flex items-center text-xs text-[#3B5998]"
                    >
                      <IoLogoFacebook className="h-6 w-6 mr-2" />
                      <span>
                        https://facebook.com/{profile?.social?.facebook}
                      </span>
                    </Link>
                  )}
                  {profile?.social.others && (
                    <Link
                      href={`https://${profile?.social?.others}`}
                      className="flex items-center text-xs text-neutral-600 dark:text-neutral-300"
                    >
                      <IoMdLink className="h-6 w-6 mr-2" />
                      <span>https://{profile?.social?.others}</span>
                    </Link>
                  )}
                </div>
                {profile.user === myProfile?.user && (
                  <EditLinks title="Editar links" />
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
};

export default ProfileAside;
