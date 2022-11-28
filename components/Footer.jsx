import { useRouter } from 'next/router';
import React from 'react';
import { BsFacebook, BsGithub, BsInstagram, BsTwitter } from 'react-icons/bs';
import { footerLinks } from '../assets/constants';

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-white dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto flex flex-col text-center md:text-left px-2">
        <h1 className="text-base sm:text-lg font-semibold text-neutral-600 dark:text-neutral-300 pt-10">
          Alguns links utilizáveis
        </h1>
        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 my-4 md:space-x-4">
          {footerLinks.map((link) => (
            <button
              className="hover:underline customText text-sm sm:text-base text-neutral-500 dark:text-neutral-500"
              onClick={() => router.push(link.redirect)}
              key={link.id}
            >
              <span>{link.title}</span>
            </button>
          ))}
        </div>

        {/* Social medias */}
        <span className="text-base sm:text-lg font-semibold text-neutral-600 dark:text-neutral-300">
          Nossas redes sociais:
        </span>
        <div className="flex justify-center md:justify-start items-center space-x-4 overflow-x-scroll scrollbar-thin my-4">
          <BsFacebook className="customFooterIcon" />
          <BsInstagram className="customFooterIcon" />
          <BsTwitter className="customFooterIcon" />
          <BsGithub className="customFooterIcon" />
        </div>
        <span className="mr-4 font-semibold w-full text-center md:text-left py-4 pb-20 md:pb-4">
          © {new Date().getFullYear()} ESM, Inc. Todos os direitos reservados.
        </span>
      </div>
    </footer>
  );
}
