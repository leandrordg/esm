import { signOut } from 'firebase/auth';
import {
  collection,
  deleteField,
  doc,
  limit,
  onSnapshot,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdExit,
  IoMdLink,
} from 'react-icons/io';
import { RiArrowRightSLine, RiExternalLinkLine } from 'react-icons/ri';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore, storage } from '../../../services/firebase';
import EditLinks from '../../Modal/EditLinks';
import EditProfile from '../../Modal/EditProfile';
import Signin from '../../Modal/Signin';

const Aside = () => {
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [user] = useAuthState(auth);
  const imageRef = useRef();
  const [value] = useCollection(
    collection(firestore, 'users'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

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

  useEffect(() => {
    if (user) {
      onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        setProfile(doc.data());
      });
    } else {
      setProfile();
    }
  }, [user]);

  return (
    <>
      <div className="sticky top-20 h-fit w-full md:w-[600px] hidden md:block">
        <aside className="flex flex-col space-y-4">
          <div
            className={`bg-white dark:bg-neutral-900 ${
              user && 'pb-4'
            } shadow sm:rounded-xl overflow-hidden`}
          >
            {user ? (
              <div className="flex flex-col relative">
                {profile?.photoURL && (
                  <Image
                    className="h-40 w-full object-cover mb-4"
                    src={profile.photoURL}
                    alt={profile.displayName}
                    width={600}
                    height={600}
                    quality={100}
                  />
                )}

                <button
                  onClick={async () => await signOut(auth)}
                  className="absolute top-4 right-4"
                >
                  <IoMdExit className="bg-white dark:bg-neutral-900 p-2 rounded-full h-10 w-10 cursor-pointer" />
                </button>

                <div className="flex items-center justify-between w-full px-4">
                  <div className="flex flex-col">
                    <p className="text-xs">{profile?.displayName}</p>
                    <p className="text-lg font-semibold">@{profile?.user}</p>
                  </div>
                  <span className="text-sm">
                    <span className="font-semibold">0</span> seguidores
                  </span>
                </div>

                <div className="flex flex-wrap px-4 my-2">
                  <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    {profile?.bio
                      ? profile.bio
                      : 'Edite seu perfil para alterar a sua biografia.'}
                  </span>
                </div>

                <div className="flex items-center space-x-2 w-full px-4 text-sm text-blue-500">
                  <Link href={`/${profile?.user}`}>Visitar perfil</Link>
                  <EditProfile perfil={profile} title="Editar perfil" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col p-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-2xl font-semibold">
                    Entre na sua conta
                  </span>
                  <p className="">
                    Entre agora para poder publicar, comentar e compartilhar.
                  </p>
                  <div className="text-white bg-blue-500 hover:bg-blue-600 rounded-lg w-fit">
                    <Signin title="Entrar agora" pX="6" pY="2" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="bg-white dark:bg-neutral-900 shadow p-4 sm:rounded-xl overflow-hidden space-y-2">
              {profile?.social ? (
                <div className="flex flex-col w-full space-y-2">
                  <span className="font-semibold">Meus links</span>
                  <div className="space-y-2">
                    {profile?.social?.twitter && (
                      <Link
                        className="flex items-center space-x-2 text-sm text-[#00acee]"
                        href={`https://twitter.com/${profile.social.twitter}`}
                      >
                        <IoLogoTwitter className="h-6 w-6" />
                        <span>
                          https://twitter.com/{profile.social.twitter}
                        </span>
                      </Link>
                    )}
                    {profile?.social?.instagram && (
                      <Link
                        className="flex items-center space-x-2 text-sm text-[#DD2A7B]"
                        href={`https://instagram.com/${profile.social.instagram}`}
                      >
                        <IoLogoInstagram className="h-6 w-6" />
                        <span>
                          https://instagram.com/{profile.social.instagram}
                        </span>
                      </Link>
                    )}
                    {profile?.social?.facebook && (
                      <Link
                        className="flex items-center space-x-2 text-sm text-[#3b5998]"
                        href={`https://facebook.com/${profile.social.facebook}`}
                      >
                        <IoLogoFacebook className="h-6 w-6" />
                        <span>
                          https://facebook.com/{profile.social.facebook}
                        </span>
                      </Link>
                    )}
                    {profile?.social?.others && (
                      <Link
                        className="flex items-center space-x-2 text-sm"
                        href={`https://${profile.social.others}`}
                      >
                        <IoMdLink className="h-6 w-6" />
                        <span>https://{profile.social.others}</span>
                      </Link>
                    )}
                  </div>
                  <EditLinks title="Editar links" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="md:text-lg">
                    Voce poderá ver o seus links aqui.
                  </span>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-tight">
                    Adicione os links de suas redes sociais para que sejam
                    exibidos públicamente.
                  </p>
                  <EditLinks title="Adicionar links" />
                </div>
              )}
            </div>
          )}

          {/* Recomendacoes */}
          {!user && (
            <div className="bg-white dark:bg-neutral-900 shadow p-4 sm:rounded-xl overflow-hidden">
              <span className="text-lg font-semibold">
                Siga algumas pessoas
              </span>
              <div className="flex flex-col space-y-2 mt-2">
                {value &&
                  value.docs.map((user) => (
                    <Link
                      href={`/${user.data().user}`}
                      key={user.id}
                      className="flex items-center space-x-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-xl transition cursor-pointer"
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
        </aside>

        {user && (
          <div className="bg-white dark:bg-neutral-900 shadow p-4 sm:rounded-xl w-full mt-4 text-xs space-x-2 text-center">
            <input
              onChange={(e) => onSelectFile(e)}
              ref={imageRef}
              type="file"
              accept="image/*"
              hidden
            />
            {!selectedImage ? (
              <button
                onClick={() => imageRef.current.click()}
                disabled={loading}
                className="text-blue-500 transition hover:underline cursor-pointer"
              >
                Editar papel de parede
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-xl">
                <div className="flex flex-col items-start px-2">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={createNewBackground}
                      disabled={loading}
                      className="text-lg text-blue-500 hover:underline"
                    >
                      {loading ? (
                        <VscLoading className="h-6 w-6 animate-spin" />
                      ) : (
                        'Salvar'
                      )}
                    </button>
                    <button
                      onClick={() => setSelectedImage('')}
                      className="text-lg text-neutral-500 hover:underline"
                    >
                      Cancelar
                    </button>
                  </div>
                  <p className="text-xs text-left text-neutral-600 dark:text-neutral-400">
                    Recomendamos imagens com resolucao de 1920x1080.
                  </p>
                </div>
                <Image
                  className="h-16 w-16 rounded-lg"
                  src={selectedImage}
                  alt={selectedImage}
                  width={400}
                  height={250}
                />
              </div>
            )}
            {profile && profile.wallpaperURL && (
              <button
                disabled={loading}
                onClick={removeBackground}
                className="text-blue-500 transition hover:underline cursor-pointer"
              >
                {loading ? 'Removendo' : 'Remover papel de parede'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Aside;
