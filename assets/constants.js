import { HomeIcon } from '@heroicons/react/24/outline';
import { IoIosAddCircleOutline } from 'react-icons/io';

export const headerLinks = [
  {
    id: 1,
    title: 'Início',
    redirect: '/',
    icon: <HomeIcon className="h-6 w-6 customText" />,
    onClick: () => {
      router.push('/');
    },
  },
  {
    id: 2,
    title: 'Criar post',
    redirect: '/',
    icon: <IoIosAddCircleOutline className="h-6 w-6 customText" />,
    onClick: () => {},
  },
];

export const footerLinks = [
  { id: 1, title: 'Blog', redirect: '/' },
  { id: 2, title: 'Política de Privacidade', redirect: '/' },
  { id: 3, title: 'Termos de serviço', redirect: '/' },
  { id: 4, title: 'Personalização', redirect: '/' },
  { id: 5, title: 'Suporte', redirect: '/' },
  { id: 6, title: 'FAQ', redirect: '/' },
];
