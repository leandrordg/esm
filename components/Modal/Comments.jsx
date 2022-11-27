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
      onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
        setProfile(doc.data());
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
                <Dialog.Panel className="flex flex-col bg-white dark:bg-neutral-900 p-10 rounded-xl w-full max-w-4xl">
                  <div className="flex flex-col items-start space-y-4 w-full">
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

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="flex items-center w-full h-10 rounded-full border customBorder overflow-hidden"
                    >
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
                        className="h-full w-full outline-none bg-transparent px-4"
                      />
                      <button
                        disabled={loading || !user}
                        onClick={sendComment}
                        className="bg-blue-500 hover:bg-blue-600 text-white h-full px-4 transition"
                      >
                        <IoMdSend />
                      </button>
                    </form>

                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800 w-full">
                      {comments?.length > 0 &&
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start py-2"
                          >
                            <Link
                              href={`/${comment.data().user}`}
                              className="min-h-[40px] min-w-[40px]"
                            >
                              <Image
                                className="rounded-full cursor-pointer"
                                src={comment.data().photoURL}
                                alt={comment.data().displayName}
                                width={40}
                                height={40}
                              />
                            </Link>
                            <div className="flex flex-col items-start text-left mx-2 w-full">
                              <div className="text-sm sm:text-base font-semibold flex items-center w-full">
                                <span className="w-full">
                                  @{comment.data().user} •{' '}
                                  <span className="text-xs font-normal">
                                    {moment(
                                      new Date(
                                        comment.data().createdAt?.toDate()
                                      )
                                    ).fromNow()}
                                  </span>
                                </span>
                                <EllipsisHorizontalIcon className="customPostIcon" />
                              </div>
                              <span className="text-xs sm:text-sm break-all">
                                {comment.data().comment}
                              </span>
                            </div>
                          </div>
                        ))}
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
