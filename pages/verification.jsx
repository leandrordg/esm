import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { use, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { VscLoading } from 'react-icons/vsc';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { auth, firestore } from '../services/firebase';

const Verification = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [data, setData] = useState({ user: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const userExists = async () => {
    setLoading(true);

    if (data.user) {
      setError('');
      const collectionRef = collection(firestore, 'users');
      const q = query(collectionRef, where('user', '==', data.user));
      const querySnap = await getDocs(q);

      if (querySnap.docs.length === 0) {
        try {
          await updateDoc(doc(firestore, 'users', user.uid), {
            user: data.user,
          });

          router.back();
        } catch (error) {
          console.log(error);
        }
      } else {
        setError('Este usuário já existe, tente outro novamente.');
      }
    } else {
      setError('Digite um usuário para prosseguir.');
    }

    setLoading(false);
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-2 py-16 sm:py-32 md:py-40 lg:py-52">
        <div className="flex flex-col">
          <div className="flex flex-col w-full">
            <h1 className="text-2xl font-semibold">Verificação do usuário</h1>
            <p className="text-sm">
              Digite o seu usuário para continuar na nossa rede.
            </p>
          </div>
          <div className="flex flex-col my-6">
            <span className="text-xs">OBS: digite apenas o usuário</span>
            <input
              className="my-2 p-2 border customBorder outline-none"
              type="text"
              placeholder="Digite seu usuário"
              value={data.user}
              onChange={(e) => setData({ user: e.target.value })}
            />
            {error && <span className="text-red-500 text-xs">{error}</span>}
          </div>
          <button onClick={userExists} className="bg-blue-500 text-white p-2 flex items-center justify-center">
            {loading ? <VscLoading className='h-6 w-6 animate-spin'/> : "Confirmar"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Verification;
