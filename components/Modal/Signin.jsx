import { Dialog, Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { FcGoogle } from 'react-icons/fc';
import { VscLoading } from 'react-icons/vsc';
import { auth } from '../../services/firebase';

const Signin = ({ title, pX, pY }) => {
  const [signInWithGoogle, loading] = useSignInWithGoogle(auth);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Menu className={`px-${pX} py-${pY}`}>
        <Menu.Button onClick={() => setIsOpen(true)}>{title}</Menu.Button>
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
                <Dialog.Panel className="flex flex-col items-center justify-center bg-white dark:bg-neutral-900 p-6 sm:p-10 md:p-14 lg:p-20 rounded-xl">
                  <Image
                    className="rounded-full"
                    unoptimized
                    src="/esm.png"
                    alt="ESM"
                    width={64}
                    height={64}
                  />
                  <div className="space-y-4 p-4 z-10">
                    <h1 className="text-xl sm:text-2xl font-semibold text-center text-black dark:text-white">
                      Entrar na sua conta
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 text-center">
                      Entre escolhendo alguns dos metodos de login abaixo:
                    </p>

                    <div className="flex flex-col border customBorder rounded-lg overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-700 dark:bg-neutral-900">
                      <button
                        type="button"
                        onClick={() => signInWithGoogle()}
                        className="flex justify-center items-center dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-3 md:px-6 md:py-4 cursor-pointer text-neutral-800 text-sm md:text-base"
                      >
                        {loading ? (
                          <VscLoading className="h-6 w-6 animate-spin" />
                        ) : (
                          <>
                            <FcGoogle className="h-6 w-6 mr-2" />
                            Entrar com google
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-neutral-600 dark:text-neutral-400">
                      Ao continuar, concordo com os
                      <span className="text-blue-500 hover:underline cursor-pointer mx-1">
                        Termos de Serviço
                      </span>
                      e
                      <span className="text-blue-500 hover:underline cursor-pointer ml-1">
                        Política de Privacidade
                      </span>
                      .
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      © All right reserved, ESM - {new Date().getFullYear()}
                    </p>
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

export default Signin;
