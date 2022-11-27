import { Dialog, Menu, Tab, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/24/outline';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import 'moment/locale/pt-br';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMdClose } from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore, storage } from '../../services/firebase';

const PostForm = ({ type }) => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [charsRemaining, setCharsRemaining] = useState(255);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const fileRef = useRef(null);
  const fileRef1 = useRef(null);

  const handleCreatePost = async () => {
    setLoading(true);

    try {
      const postDocRef = await addDoc(collection(firestore, 'posts'), {
        creatorId: user.uid,
        displayName: profile.displayName,
        user: profile.user ? profile.user : profile.email.split('@')[0],
        photoURL: profile.photoURL,
        title: title,
        numberOfComments: 0,
        likeStatus: 0,
        createdAt: serverTimestamp(),
        isModerator: user.uid,
      });

      // Se existir arquivo, entao
      if (selectedFile) {
        const imageRef = ref(
          storage,
          `posts/${postDocRef.id}/${selectedFile.split('/')[0]}`
        );

        await uploadString(imageRef, selectedFile, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);

        await updateDoc(postDocRef, {
          fileURL: downloadURL,
        });
      }

      // Se existir papel de parede
      if (selectedBackground) {
        const imageRef = ref(
          storage,
          `posts/${postDocRef.id}/background/${
            selectedBackground.split('/')[0]
          }`
        );

        await uploadString(imageRef, selectedBackground, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);

        await updateDoc(postDocRef, {
          background: downloadURL,
        });
      }

      setLoading(false);
      setIsOpen(false);

      setTimeout(() => {
        setTitle('');
        setSelectedFile('');
        setSelectedBackground('');
      }, 2000);
    } catch (error) {
      console.log('createPost error', error);
    }
  };

  const onSelectFile = (event, method) => {
    const reader = new FileReader();
    if (event.target.files?.[0]) {
      reader.readAsDataURL(event.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        if (method === 'file') {
          setSelectedFile(readerEvent.target.result);
        } else {
          setSelectedBackground(readerEvent.target.result);
        }
      }
    };
  };

  const handleChange = (event) => {
    if (event.target.value.length > 255) return;
    setTitle(event.target.value);
    setCharsRemaining(255 - event.target.value.length);
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
      <Menu
        className={`flex z-10 cursor-pointer justify-center items-center space-x-2 ${
          !type && 'customHeaderIcon'
        }`}
      >
        <div className="relative">
          {type === 'home' ? (
            <Menu.Button onClick={() => setIsOpen(true)} className='bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white w-full p-2 px-4 sm:px-6 rounded-full md:rounded-lg text-xs sm:text-sm transition'>
              Criar agora
            </Menu.Button>
          ) : (
            <Menu.Button onClick={() => setIsOpen(true)}>
              <PlusIcon className="h-7 w-7" />
            </Menu.Button>
          )}
        </div>
      </Menu>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-20"
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <Dialog.Title
                      as="h3"
                      className="text-xl sm:text-2xl font-medium leading-6 text-neutral-900 dark:text-neutral-200"
                    >
                      Criar publicação
                    </Dialog.Title>
                    <IoMdClose
                      onClick={() => setIsOpen(false)}
                      className="customModalIcon h-10 w-10"
                    />
                  </div>
                  <div className="mt-2">
                    <textarea
                      value={title}
                      onChange={handleChange}
                      className="w-full rounded-lg outline-none bg-transparent min-h-[100px] max-h-[200px] border customBorder p-2"
                      placeholder="Adicione o titulo do post"
                    />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {charsRemaining} caracteres restantes.
                    </p>
                  </div>

                  <Tab.Group as="div" className="mt-2">
                    <span className="text-sm">Adicionar na publicação:</span>
                    <Tab.List className="flex items-center border customBorder rounded-lg divide-x divide-neutral-100 dark:divide-neutral-800">
                      <input
                        onChange={(event) => onSelectFile(event, 'file')}
                        ref={fileRef}
                        type="file"
                        accept="image/*,video/*"
                        hidden
                      />
                      <input
                        onChange={(event) => onSelectFile(event, 'background')}
                        ref={fileRef1}
                        type="file"
                        accept="image/*"
                        hidden
                      />
                      <Tab
                        onClick={
                          !selectedFile && (() => fileRef.current.click())
                        }
                        className="px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        Imagem/vídeo
                      </Tab>
                      <Tab
                        onClick={
                          !selectedBackground &&
                          (() => fileRef1.current.click())
                        }
                        className="px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        Papel de parede
                      </Tab>
                    </Tab.List>
                    <Tab.Panels className="my-2">
                      <Tab.Panel>
                        {selectedFile && (
                          <div className="relative">
                            {selectedFile.includes('image') ? (
                              <img
                                className="w-full max-h-[400px] object-cover"
                                src={selectedFile}
                                alt="Imagem corrompida ou muito grande."
                              />
                            ) : (
                              <video
                                controls
                                src={selectedFile}
                                className="w-full max-h-[400px] object-cover"
                                alt="Vídeo corrompido ou muito grande."
                              />
                            )}

                            <div className="absolute top-4 right-4">
                              <IoMdClose
                                onClick={() => setSelectedFile('')}
                                className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 transition cursor-pointer shadow"
                              />
                            </div>
                          </div>
                        )}
                      </Tab.Panel>
                      <Tab.Panel>
                        {selectedBackground && (
                          <div className="relative">
                            <img
                              className="w-full max-h-[400px] object-cover"
                              src={selectedBackground}
                              alt="Imagem corrompida ou muito grande."
                            />
                            <div className="absolute top-4 right-4">
                              <IoMdClose
                                onClick={() => setSelectedBackground('')}
                                className="h-10 w-10 bg-neutral-100 dark:bg-neutral-800 rounded-full p-1 transition cursor-pointer shadow"
                              />
                            </div>
                          </div>
                        )}
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      className="py-1 px-6 w-full md:w-fit rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition"
                      onClick={handleCreatePost}
                    >
                      {loading ? (
                        <VscLoading className="h-6 w-6 animate-spin" />
                      ) : (
                        'Publicar'
                      )}
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

export default PostForm;
