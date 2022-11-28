import { Dialog, Menu, Transition } from '@headlessui/react';
import { updateProfile } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import Image from 'next/image';
import React, { Fragment, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMdClose } from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore, storage } from '../../services/firebase';

const EditProfile = ({ title, perfil }) => {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState();
  const [selectedImage, setSelectedImage] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSelectFile = (event) => {
    setSelectedImage('');

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

  const updateProfilePicture = async () => {
    setLoading(true);

    const docRef = doc(firestore, 'users', user.uid);

    const imageRef = ref(
      storage,
      `users/${user.uid}/photo/${selectedImage.split('/')[0]}`
    );

    await uploadString(imageRef, selectedImage, 'data_url');
    const downloadURL = await getDownloadURL(imageRef);

    await updateDoc(docRef, { photoURL: downloadURL });

    setTimeout(() => {
      setIsOpen(false);
      setSelectedImage('');
    }, 1000);

    setLoading(false);
  };

  const onSubmit = async () => {
    setError('');
    setLoading(true);

    const docRef = doc(firestore, 'users', user.uid);

    // Verificando se já existe o usuário
    if (formData?.user) {
      const collectionRef = collection(firestore, 'users');
      const q = query(collectionRef, where('user', '==', formData.user));
      const querySnap = await getDocs(q);

      if (querySnap.docs.length > 0) {
        setError('Este usuário já existe. Tente outro novamente.');
      }
    }

    try {
      await updateDoc(docRef, formData);
    } catch (error) {
      console.log(error);
    }

    setTimeout(() => {
      setError('');
      setIsOpen(false);
      setFormData();
    }, 1000);

    setLoading(false);
  };

  return (
    <>
      <Menu>
        <div className="relative">
          <Menu.Button onClick={() => setIsOpen(true)}>{title}</Menu.Button>
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
                <Dialog.Panel className="flex flex-col bg-white dark:bg-neutral-900 p-4 sm:p-8 md:p-12 lg:p-20 rounded-xl w-[1000px]">
                  <div className="flex flex-col items-start w-full">
                    <div className="flex w-full items-center space-x-2 justify-between">
                      <Dialog.Title className="text-xl sm:text-2xl font-semibold text-center">
                        Editar perfil
                      </Dialog.Title>
                      <IoMdClose
                        onClick={() => setIsOpen(false)}
                        className="customModalIcon"
                      />
                    </div>

                    {/* <p className='text-neutral-600 dark:text-neutral-300'>Ao alterar o nome de usuário, deverá esperar pelo menos 30 dias para alterar novamente.</p> */}
                    <div className="flex items-end space-x-2 sm:space-x-4 md:space-x-8 w-full">
                      <div className="flex flex-[2] flex-col items-start space-y-2  w-full">
                        <div className="flex flex-col w-full items-start">
                          <span className="text-sm">Nome</span>
                          <input
                            type="text"
                            onChange={handleChange}
                            name="displayName"
                            placeholder={perfil?.displayName}
                            className="w-full outline-none rounded-lg p-2 px-4 border customBorder"
                          />
                        </div>

                        <div className="flex flex-col w-full items-start relative">
                          <span className="text-sm">Usuário</span>
                          <div className="flex items-center rounded-lg border customBorder bg-white dark:bg-neutral-700 h-11 w-full overflow-hidden">
                            <span className="mx-2 text-neutral-400 dark:text-neutral-500 select-none">
                              @
                            </span>
                            <input
                              type="text"
                              onChange={handleChange}
                              name="user"
                              placeholder={perfil?.user}
                              className="w-full outline-none h-full bg-transparent"
                            />
                          </div>
                          {error && (
                            <p className="text-xs text-red-500">{error}</p>
                          )}
                        </div>

                        <div className="flex flex-col w-full items-start overflow-hidden">
                          <span>Biografia</span>
                          <textarea
                            name="bio"
                            placeholder={
                              perfil?.bio
                                ? perfil.bio
                                : 'Digite aqui a sua biografia'
                            }
                            onChange={handleChange}
                            className="rounded-lg border customBorder bg-white dark:bg-neutral-700 w-full p-2 outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex-1 h-full mt-4 relative">
                        {perfil?.photoURL && (
                          <>
                            <Image
                              className="w-full h-64 rounded-lg object-cover"
                              src={selectedImage || perfil?.photoURL}
                              alt={selectedImage || perfil?.displayName}
                              width={100}
                              height={100}
                              quality={100}
                            />
                            {selectedImage && (
                              <button
                                onClick={() => setSelectedImage('')}
                                className="absolute top-2 right-2"
                              >
                                <IoMdClose className="customModalIcon" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="my-4">
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={onSelectFile}
                        hidden
                      />
                      {selectedImage ? (
                        <button
                          onClick={updateProfilePicture}
                          className="text-blue-500 hover:underline"
                        >
                          {loading ? (
                            <VscLoading className="h-6 w-6 animate-spin" />
                          ) : (
                            'Salvar foto de perfil'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => inputRef.current.click()}
                          className="text-blue-500 hover:underline"
                        >
                          Alterar foto de perfil
                        </button>
                      )}
                    </div>

                    <button
                      onClick={onSubmit}
                      disabled={loading}
                      className="flex items-center justify-center w-full py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-600 transition"
                    >
                      {loading ? (
                        <VscLoading className="h-6 w-6 animate-spin" />
                      ) : (
                        'Salvar'
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

export default EditProfile;
