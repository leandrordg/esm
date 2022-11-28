import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  IoIosNotificationsOutline,
  IoMdMoon,
  IoMdSearch,
  IoMdSunny,
} from 'react-icons/io';
import { auth, firestore } from '../services/firebase';
import MobileProfile from './Modal/MobileProfile';
import PostForm from './Modal/PostForm';
import Signin from './Modal/Signin';

export default function Header() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState();
  const router = useRouter();
  const { systemTheme, theme, setTheme } = useTheme();

  const renderThemeChanger = () => {
    const currentTheme = theme === 'system' ? systemTheme : theme;

    if (currentTheme === 'dark') {
      return (
        <IoMdSunny
          onClick={() => setTheme('light')}
          className="customHeaderIcon"
        />
      );
    }

    return (
      <IoMdMoon onClick={() => setTheme('dark')} className="customHeaderIcon" />
    );
  };

  const createUserDocument = async (user) => {
    const docRef = doc(firestore, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(
        doc(firestore, 'users', user.uid),
        JSON.parse(JSON.stringify(user))
      );

      router.push('/verification');
    }
  };

  useEffect(() => {
    if (user) {
      createUserDocument(user);
    }
  }, [user]);

  return (
    <>
      <header className="sticky top-0 bg-white dark:bg-[#121212] z-20">
        <div className="flex items-center justify-between p-2 max-w-7xl mx-auto">
          <Link href="/">
            <span className="text-3xl font-semibold">ESM</span>
          </Link>
          <div className="flex items-center space-x-2">
            <IoMdSearch className="customHeaderIcon" />

            {renderThemeChanger()}

            {user ? (
              <div className="flex items-center space-x-1">
                <PostForm />
                {/* <IoIosNotificationsOutline className="customHeaderIcon" /> */}
              </div>
            ) : (
              <Signin title="Entrar" />
            )}
          </div>
        </div>
      </header>

      {router.pathname !== '/verification' && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-neutral-900 border-t customBorder z-20">
          <MobileProfile />
        </nav>
      )}
    </>
  );
}
