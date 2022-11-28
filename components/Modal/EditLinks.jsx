import { Dialog, Menu, Transition } from '@headlessui/react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { Fragment, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdClose,
  IoMdLink,
} from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { auth, firestore } from '../../services/firebase';

const EditLinks = ({ title }) => {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState();
  const [loading, setLoading] = useState();
  const [formData, setFormData] = useState();

  const handleChange = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);

    const docRef = doc(firestore, 'users', user.uid);

    try {
      await updateDoc(docRef, {
        social: formData,
      });
    } catch (error) {
      console.log(error);
    }

    setTimeout(() => {
      setLoading(false);
      setIsOpen(false);
    }, 1000);
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
      <Menu>
        <div className="relative">
          <Menu.Button
            className="text-blue-500 text-sm"
            onClick={() => setIsOpen(true)}
          >
            {title}
          </Menu.Button>
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
                        Editar Links
                      </Dialog.Title>
                      <IoMdClose
                        onClick={() => setIsOpen(false)}
                        className="customModalIcon"
                      />
                    </div>

                    <div className="flex flex-col space-y-1 items-start mb-4">
                      <span className="text-sm">
                        Os links devem ser adicionados com somente o nome de
                        usuário.
                      </span>
                      <span className="text-xs">Ex: eu_mesmo</span>
                    </div>

                    <div className="flex flex-col w-full space-y-2">
                      <div className="flex items-center rounded-lg border customBorder bg-white dark:bg-neutral-700 w-full overflow-hidden">
                        <IoLogoTwitter className="h-5 w-5 mx-2 text-neutral-400 dark:text-neutral-500" />
                        <input
                          type="text"
                          placeholder={profile?.social?.twitter}
                          className="w-full outline-none p-2 bg-transparent"
                          onChange={handleChange}
                          name="twitter"
                        />
                      </div>

                      <div className="flex items-center rounded-lg border customBorder bg-white dark:bg-neutral-700 w-full overflow-hidden">
                        <IoLogoInstagram className="h-5 w-5 mx-2 text-neutral-400 dark:text-neutral-500" />
                        <input
                          type="text"
                          placeholder={profile?.social?.instagram}
                          className="w-full outline-none p-2 bg-transparent"
                          onChange={handleChange}
                          name="instagram"
                        />
                      </div>

                      <div className="flex items-center rounded-lg border customBorder bg-white dark:bg-neutral-700 w-full overflow-hidden">
                        <IoLogoFacebook className="h-5 w-5 mx-2 text-neutral-400 dark:text-neutral-500" />
                        <input
                          type="text"
                          placeholder={profile?.social?.facebook}
                          className="w-full outline-none p-2 bg-transparent"
                          onChange={handleChange}
                          name="facebook"
                        />
                      </div>

                      <div className="flex flex-col items-start space-y-1 pt-4">
                        <span className="text-sm">
                          Para o meu url, adicione o endereco do site utilizando
                          o final do url.
                        </span>
                        <span className="text-xs">Ex: esm-tcc.vercel.app</span>
                      </div>

                      <div className="flex items-center rounded-lg border customBorder bg-white dark:bg-neutral-700 w-full overflow-hidden">
                        <IoMdLink className="h-5 w-5 mx-2 text-neutral-400 dark:text-neutral-500" />
                        <input
                          type="text"
                          placeholder={profile?.social?.others}
                          className="w-full outline-none p-2 bg-transparent"
                          onChange={handleChange}
                          name="others"
                        />
                      </div>
                    </div>

                    <button
                      onClick={onSubmit}
                      disabled={loading || !formData}
                      className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 w-full p-2 mt-4 transition text-white rounded-lg"
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

export default EditLinks;
