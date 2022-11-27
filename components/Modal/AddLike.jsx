import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BsHeart, BsHeartFill } from 'react-icons/bs';
import { auth, firestore } from '../../services/firebase';

const AddLike = ({ post }) => {
  const [user] = useAuthState(auth);
  const [likes, setLikes] = useState();
  const [profile, setProfile] = useState();
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState();

  const likePost = async () => {
    setLoading(true);

    if (hasLiked) {
      await deleteDoc(doc(firestore, 'posts', post.id, 'likes', user.uid));
    } else {
      await setDoc(doc(firestore, 'posts', post.id, 'likes', user.uid), {
        user: profile.user,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        createdAt: serverTimestamp(),
      });
    }

    setLoading(false);
  };

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(firestore, 'posts', post.id, 'likes'),
          orderBy('createdAt', 'desc')
        ),
        (snapshot) => setLikes(snapshot.docs)
      ),
    []
  );

  useEffect(
    () => setHasLiked(likes?.findIndex((like) => like.id === user?.uid) !== -1),
    [likes, user]
  );

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
    <button
      onClick={likePost}
      disabled={loading}
      className={`flex flex-col space-y-1 items-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer ${
        post.background && 'bg-white dark:bg-neutral-900'
      }`}
    >
      <span className="text-xs select-none">{likes?.length}</span>
      {hasLiked ? (
        <BsHeartFill className="h-8 w-8 sm:w-9 sm:h-9 text-blue-500 px-2 pb-2 hover:scale-110 transition" />
      ) : (
        <BsHeart className="h-8 w-8 sm:w-9 sm:h-9 px-2 pb-2 hover:scale-110 transition" />
      )}
    </button>
  );
};

export default AddLike;
