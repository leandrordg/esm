import { Dialog, Menu, Transition } from '@headlessui/react';
import { collection, doc, onSnapshot, query } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { IoMdArrowBack, IoMdSearch } from 'react-icons/io';
import { RiArrowRightSLine } from 'react-icons/ri';
import { firestore } from '../../services/firebase';

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, loading] = useCollection(collection(firestore, 'users'));
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const newFilter = value?.docs.filter((value) => {
      return value.data().user.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setFilteredData(newFilter);
  }, [searchTerm]);

  return (
    <>
      <Menu as={Fragment}>
        <Menu.Button>
          <IoMdSearch
            onClick={() => setIsOpen(true)}
            className="customHeaderIcon"
          />
        </Menu.Button>
      </Menu>

      <Transition show={isOpen} as={Fragment}>
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

          <div className="fixed w-full bottom-0 md:inset-0 md:flex md:justify-center md:items-center overflow-y-auto">
            <div className="flex w-full items-center justify-center text-center md:max-w-2xl">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex flex-col items-start bg-white dark:bg-neutral-800 w-full h-[600px] md:rounded-xl overflow-hidden">
                  <div className="flex flex-col w-full">
                    <div className="flex items-center h-14 bg-neutral-100 dark:bg-neutral-900 w-full">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="h-full flex justify-center items-center w-16"
                      >
                        <IoMdArrowBack className="w-6 h-6" />
                      </button>
                      <input
                        className="h-full w-full bg-transparent outline-none"
                        placeholder="Digite o usuário da pessoa"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="text"
                      />
                    </div>

                    {filteredData?.length != 0 && searchTerm.length != 0 && (
                      <div className="flex flex-col items-start h-[600px] overflow-y-scroll scrollbar-thin">
                        <span className="text-base sm:text-lg font-semibold m-4 text-neutral-600 dark:text-neutral-300">
                          Encontrado {filteredData?.length} resultados.
                        </span>

                        {filteredData?.map((user) => (
                          <Link
                            href={`/${user.data()?.user}`}
                            key={user.data()?.uid}
                            className="flex items-center p-2 px-4 border-b customBorder w-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                          >
                            <div className="flex items-center space-x-2 sm:space-x-4 w-full">
                              <Image
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                                src={user.data()?.photoURL}
                                alt={user.data()?.displayName}
                                width={200}
                                height={200}
                                quality={100}
                              />
                              <div className="flex flex-col items-start">
                                <span className="text-xs">
                                  {user.data()?.displayName}
                                </span>
                                <span className="text-base sm:text-lg font-semibold">
                                  @{user.data()?.user}
                                </span>
                              </div>
                            </div>
                            <RiArrowRightSLine className="w-6 h-6" />
                          </Link>
                        ))}
                      </div>
                    )}
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

export default Search;
