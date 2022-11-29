import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  ChatBubbleBottomCenterTextIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { IoMdClose, IoMdSend } from 'react-icons/io';
import { auth, firestore } from '../../services/firebase';

const Comments = ({ post }) => {
  const [user] = useAuthState(auth);
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState();

  const sendComment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const postComment = comment;
    setComment('');

    const collectionRef = collection(firestore, 'posts', post.id, 'comments');

    try {
      await addDoc(collectionRef, {
        user: profile?.user,
        displayName: profile?.displayName,
        photoURL: profile?.photoURL,
        comment: postComment,
        isModerator: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      onSnapshot(doc(firestore, 'users', user.uid), (snapshot) => {
        setProfile(snapshot.data());
      });
    } else {
      setProfile();
    }
  }, [user]);

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'posts', post.id, 'comments'),
          orderBy('createdAt', 'desc')
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    []
  );

  return (
    <>
      <Menu as={Fragment}>
        <Menu.Button onClick={() => setIsOpen(true)}>
          <div
            className={`flex flex-col space-y-1 items-center p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer ${
              post.background && 'bg-white dark:bg-neutral-900'
            }`}
          >
            <span className="text-xs select-none">{comments.length}</span>
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5 sm:w-6 sm:h-6" />
          </div>
        </Menu.Button>
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
                <Dialog.Panel className="flex flex-col bg-white dark:bg-neutral-900 p-10 w-full max-h-[650px] md:rounded-xl">
                  <div className="flex flex-col items-start space-y-2 w-full">
                    <div className="flex w-full items-center space-x-2">
                      <div className="flex items-center space-x-2 w-full">
                        <Dialog.Title className="text-xl sm:text-2xl font-semibold text-center">
                          Comentários
                        </Dialog.Title>
                        <span className="text-lg">{comments.length}</span>
                      </div>
                      <IoMdClose
                        onClick={() => setIsOpen(false)}
                        className="customModalIcon"
                      />
                    </div>

                    <div className="w-full max-h-[500px] overflow-y-scroll scrollbar-thin">
                      {comments?.length > 0 &&
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start py-2"
                          >
                            <Link
                              href={`/${
                                comment.data().isModerator === profile?.uid
                                  ? profile?.user
                                  : comment.data().user
                              }`}
                              className="min-h-[40px] min-w-[40px]"
                            >
                              <Image
                                className="rounded-full cursor-pointer w-14 h-12 object-cover"
                                src={
                                  comment.data().isModerator === profile?.uid
                                    ? profile?.photoURL
                                    : comment.data().photoURL
                                }
                                alt={
                                  comment.data().isModerator === profile?.uid
                                    ? profile?.displayName
                                    : comment.data().displayName
                                }
                                width={40}
                                height={40}
                              />
                            </Link>
                            <div className="flex flex-col items-start text-left mx-2 w-full">
                              <div className="flex flex-col items-start w-full">
                                <span className="text-sm sm:text-base font-semibold">
                                  {comment.data().isModerator === profile?.uid
                                    ? profile?.displayName
                                    : comment.data().displayName}{' '}
                                  • @
                                  {comment.data().isModerator === profile?.uid
                                    ? profile?.user
                                    : comment.data().user}
                                </span>
                                <span className="text-xs font-normal text-neutral-600 dark:text-neutral-300">
                                  {moment(
                                    new Date(comment.data().createdAt?.toDate())
                                  ).fromNow()}
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm break-all mt-2">
                                {comment.data().comment}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex items-center w-full h-10">
                      <input
                        disabled={!user}
                        placeholder={
                          user
                            ? `Comentar como ${user.displayName}`
                            : 'Entre para comentar'
                        }
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="px-6 h-full outline-none w-full rounded-l-lg"
                      />
                      <button
                        disabled={loading || !user || !comment}
                        onClick={sendComment}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-full px-4 transition rounded-r-lg"
                      >
                        <IoMdSend />
                      </button>
                    </div>
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

export default Comments;
