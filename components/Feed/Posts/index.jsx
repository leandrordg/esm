import { doc, onSnapshot } from 'firebase/firestore';
import moment from 'moment/moment';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../../../services/firebase';
import AddLike from '../../Modal/AddLike';
import Comments from '../../Modal/Comments';
import DeletePost from '../../Modal/Delete';

const Posts = ({ post }) => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState();

  useEffect(
    () =>
      onSnapshot(doc(firestore, 'users', post?.creatorId), (doc) => {
        setProfile(doc.data());
      }),
    []
  );

  return (
    <div
      className={`border-y sm:border customBorder dark:border-none sm:rounded-lg overflow-hidden relative z-10 ${
        !post.background && 'bg-white dark:bg-neutral-900'
      }`}
    >
      {post?.background && (
        <Image
          src={post?.background}
          alt={post?.background}
          className="absolute w-full h-full object-cover -z-10"
          priority
          width={200}
          height={200}
        />
      )}
      <div className="flex items-start">
        {/* Left side */}
        <div className="flex flex-col items-center text-sm md:text-base p-1 md:p-2 space-y-2">
          <div className="group relative">
            {post?.photoURL && (
              <Image
                className="rounded-full object-cover w-8 sm:w-10 h-8 sm:h-10 cursor-pointer border-2 customBorder text-xs"
                src={profile?.photoURL}
                alt={profile?.displayName}
                width={100}
                height={100}
                quality={100}
              />
            )}
            <Link href={`/${profile?.user}`}>
              <div className="absolute hidden top-0 left-10 bg-white dark:bg-neutral-900 border customBorder rounded-lg p-2 z-20 group-hover:flex flex-col min-w-[150px]">
                <p className="text-xs">{profile?.displayName}</p>
                <p className="font-semibold">@{profile?.user}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {moment(new Date(post.createdAt?.toDate())).fromNow()}.
                </p>
              </div>
            </Link>
          </div>

          <AddLike post={post} />
          <Comments post={post} />
          {post.isModerator === user?.uid && <DeletePost post={post} />}
        </div>

        {/* Right Side */}
        <div className="w-full relative">
          {post.fileURL ? (
            post.fileURL?.includes('image') ? (
              <div className="flex flex-col">
                {post.title && (
                  <div
                    className={`my-2 text-sm border-b customBorder w-full break-all ${
                      post.background &&
                      'bg-white dark:bg-neutral-900 p-2 rounded-l-xl'
                    }`}
                  >
                    {post.title}
                  </div>
                )}
                <Image
                  className="w-full max-h-[600px] object-cover"
                  src={post.fileURL}
                  alt="Carregando..."
                  width={600}
                  height={600}
                />
              </div>
            ) : (
              <div className="min-h-fit flex text-center items-center justify-center relative group">
                <video
                  controls
                  className="w-full h-full max-h-[600px] object-cover outline-none"
                  src={post.fileURL}
                  alt="Carregando..."
                />
              </div>
            )
          ) : (
            <div className="min-h-[240px] flex items-center justify-center">
              {post.title}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Posts;
