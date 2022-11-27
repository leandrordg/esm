/* eslint-disable @next/next/no-img-element */
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import moment from 'moment/moment';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BsHeart } from 'react-icons/bs';
import { auth } from '../../../services/firebase';
import Comments from '../../Modal/Comments';
import AddLike from '../../Modal/AddLike';
import DeletePost from '../../Modal/Delete';

const Posts = ({ post }) => {
  const [user] = useAuthState(auth);

  return (
    <div
      className={`border-y sm:border customBorder dark:border-none sm:rounded-lg overflow-hidden relative z-10 ${
        !post.background && 'bg-white dark:bg-neutral-900'
      }`}
    >
      {post.background && (
        <Image
          className="absolute w-full h-full object-cover -z-10"
          src={post.background}
          alt={post.background}
          priority
          width={200}
          height={200}
        />
      )}
      <div className="flex items-start">
        {/* Left side */}
        <div className="flex flex-col items-center text-sm md:text-base p-1 md:p-2 space-y-2">
          <div className="group relative">
            <img
              className="rounded-full w-8 sm:w-10 cursor-pointer border-2 customBorder text-xs"
              src={post.photoURL}
              alt={post.displayName}
            />
            <Link href={`/${post.user}`}>
              <div className="absolute hidden top-0 left-10 bg-white dark:bg-neutral-900 border customBorder rounded-lg p-2 z-20 group-hover:flex flex-col min-w-[150px]">
                <p className="text-xs">{post.displayName}</p>
                <p className="font-semibold">@{post.user}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {moment(new Date(post.createdAt?.toDate())).fromNow()}.
                </p>
              </div>
            </Link>
          </div>

          <AddLike post={post} />
          <Comments post={post} />
          {post.isModerator === user?.uid && <DeletePost post={post} />}
          <EllipsisVerticalIcon
            className={`customPostIcon z-10 ${
              post.background && 'bg-white dark:bg-neutral-900'
            }`}
          />
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
                <img
                  className="w-full max-h-[600px] object-cover"
                  src={post.fileURL}
                  alt="Carregando..."
                />
              </div>
            ) : (
              <div className="min-h-fit flex text-center items-center justify-center relative group">
                <video
                  controls
                  className="w-full h-full max-h-[600px] object-cover outline-none"
                  src={post.fileURL}
                  alt="video"
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
