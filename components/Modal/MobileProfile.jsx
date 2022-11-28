import { Dialog, Menu, Transition } from '@headlessui/react';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import Image from 'next/image';
import Link from 'next/link';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdArrowDropdown,
  IoMdArrowDropup,
  IoMdClose,
  IoMdExit,
  IoMdLink,
} from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore, storage } from '../../services/firebase';
import EditLinks from './EditLinks';
import EditProfile from './EditProfile';
import Signin from './Signin';

const MobileProfile = () => {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState();
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();

  const handleSignOut = () => {
    setIsOpen(false);

    setTimeout(async () => {
      await signOut(auth);
    }, 1000);
  };

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
      <Menu className="w-full">
        {user ? (
          <Menu.Button onClick={() => setIsOpen(true)}>
            <div className="flex items-center p-2 space-x-2">
              {profile?.photoURL && (
                <Image
                  className="border customBorder rounded-full text-xs"
                  src={profile?.photoURL}
                  alt={profile?.user}
                  width={40}
                  height={40}
                />
              )}
              <div className="flex flex-col items-start w-full">
                <span className="text-xs">Meu perfil</span>
                <span className="text-sm font-semibold">@{profile?.user}</span>
              </div>
              {isOpen ? (
                <IoMdArrowDropdown className="customHeaderIcon" />
              ) : (
                <IoMdArrowDropup className="customHeaderIcon" />
              )}
            </div>
          </Menu.Button>
        ) : (
            <Signin title="Entrar agora" pY={4} width='full' />
        )}
      </Menu>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20 w-full"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed bottom-0 right-0 overflow-y-auto w-full">
            <div className="flex w-full text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex flex-col w-full transform overflow-hidden bg-white dark:bg-neutral-900 p-4 text-left shadow-xl divide-y divide-neutral-100 dark:divide-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Meu perfil</span>
                    <IoMdClose
                      onClick={() => setIsOpen(false)}
                      className="customModalIcon h-10 w-10"
                    />
                  </div>

                  <div className="flex items-start mb-4 pt-4">
                    <div className="flex flex-col flex-1 space-y-2">
                      <div className="flex flex-col">
                        <span className="text-sm">{profile?.displayName}</span>
                        <span className="text-lg font-semibold">
                          @{profile?.user}
                        </span>
                      </div>

                      <span className="text-xs">
                        <span className="font-semibold">0</span> seguidores
                      </span>

                      <div className="flex flex-wrap">
                        {profile && (
                          <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                            {profile.bio
                              ? profile.bio
                              : 'Edite seu perfil para alterar a sua biografia.'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 w-full text-sm text-blue-500">
                        <Link href={`/${profile?.user}`}>Visitar perfil</Link>
                        <EditProfile perfil={profile} title="Editar perfil" />
                      </div>
                    </div>
                    <div>
                      <Image
                        className="h-32 w-full object-cover rounded-full"
                        src={profile && profile.photoURL}
                        alt={profile && profile.displayName}
                        width={400}
                        height={250}
                        sizes="100vw"
                        quality={100}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col w-full pt-4 mb-4">
                    <span className="font-semibold">Meus links</span>
                    {profile?.social ? (
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
                        <EditLinks title="Editar links" />
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1">
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

                  <div className="w-full text-sm space-x-2 pt-4 mb-4">
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
                      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 rounded-xl">
                        <div className="flex flex-col items-start">
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
                          width={16}
                          height={16}
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

                  <div className="pt-4 mb-4">
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-blue-500"
                    >
                      Desconectar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MobileProfile;
