import { Dialog, Transition } from '@headlessui/react';
import { deleteDoc, doc } from 'firebase/firestore';
import React, { Fragment, useState } from 'react';
import { IoIosCloseCircle, IoMdClose, IoMdTrash } from 'react-icons/io';
import { VscLoading } from 'react-icons/vsc';
import { firestore } from '../../services/firebase';

const DeletePost = ({ post }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deletePost = async (postId) => {
    setLoading(true);

    await deleteDoc(doc(firestore, 'posts', postId));

    setTimeout(() => {
      setLoading(false);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <>
      <IoMdTrash
        onClick={() => setIsOpen(true)}
        // onClick={() => deletePost(post.id)}
        className={`customPostIcon z-10 ${
          post.background && 'bg-white dark:bg-neutral-900'
        }`}
      />

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
                <Dialog.Panel className="flex flex-col items-center justify-center bg-white dark:bg-neutral-900 p-6 sm:p-10 md:p-14 lg:p-20 rounded-xl relative">
                  <IoMdClose
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 md:top-12 md:right-12 customModalIcon"
                  />
                  <IoIosCloseCircle className="h-16 w-16 md:h-24 md:w-24 bg-red-500 rounded-full text-white dark:text-neutral-900" />
                  <div className="space-y-4 p-4 z-10">
                    <h1 className="text-xl sm:text-2xl font-semibold text-center text-black dark:text-white">
                      Excluir a publicação
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 text-center">
                      Confirme se deseja excluir sua publicação, se confirmado,
                      não poderá vê-la posteriormente.
                    </p>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-4 w-full rounded-lg text-xs sm:text-sm md:text-base transition"
                    >
                      {loading ? (
                        <VscLoading className="h-6 w-6 animate-spin" />
                      ) : (
                        <span>Confirmar</span>
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

export default DeletePost;
