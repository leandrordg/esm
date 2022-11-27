import Image from 'next/image';
import Link from 'next/link';
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTwitter,
  IoMdLink,
} from 'react-icons/io';

const ProfileAside = ({ profile }) => {
  return (
    <>
      {profile && (
        <aside className="sticky top-20 h-fit w-full md:w-[600px] hidden md:block">
          <div className="flex flex-col space-y-4">
            <div
              className={`bg-white dark:bg-neutral-900 ${
                profile[0] && 'pb-4'
              } shadow sm:rounded-xl overflow-hidden`}
            >
              <div className="flex flex-col relative">
                <Image
                  className="h-40 w-full object-cover mb-4"
                  src={profile[0]?.photoURL}
                  alt={profile[0]?.displayName}
                  width={400}
                  height={250}
                  sizes="100vw"
                  quality={100}
                />

                <div className="flex items-center justify-between w-full px-4">
                  <div>
                    <p className="text-xs">{profile[0]?.displayName}</p>
                    <p className="text-lg font-semibold">@{profile[0]?.user}</p>
                  </div>
                  <span className="text-sm">
                    <span className="font-semibold">0</span> seguidores
                  </span>
                </div>

                <div className="flex flex-wrap px-4 my-2">
                  <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
                    {profile[0]?.bio}
                  </span>
                </div>
              </div>
            </div>

            {profile[0]?.social && (
              <div className="bg-white dark:bg-neutral-900 shadow p-4 sm:rounded-xl overflow-hidden">
                <div className="flex flex-col space-y-2">
                  {profile[0]?.social.twitter && (
                    <Link
                      href={`https://twitter.com/${profile[0]?.social?.twitter}`}
                      className="flex items-center text-xs text-[#00acee]"
                    >
                      <IoLogoTwitter className="h-6 w-6 mr-2" />
                      <span>
                        https://twitter.com/{profile[0]?.social?.twitter}
                      </span>
                    </Link>
                  )}
                  {profile[0]?.social.instagram && (
                    <Link
                      href={`https://instagram.com/${profile[0]?.social?.instagram}`}
                      className="flex items-center text-xs text-[#d12156]"
                    >
                      <IoLogoInstagram className="h-6 w-6 mr-2" />
                      <span>
                        https://instagram.com/{profile[0]?.social?.instagram}
                      </span>
                    </Link>
                  )}
                  {profile[0]?.social.facebook && (
                    <Link
                      href={`https://facebook.com/${profile[0]?.social?.facebook}`}
                      className="flex items-center text-xs text-[#3B5998]"
                    >
                      <IoLogoFacebook className="h-6 w-6 mr-2" />
                      <span>
                        https://facebook.com/{profile[0]?.social?.facebook}
                      </span>
                    </Link>
                  )}
                  {profile[0]?.social.others && (
                    <Link
                      href={`https://${profile[0]?.social?.others}`}
                      className="flex items-center text-xs text-neutral-600 dark:text-neutral-300"
                    >
                      <IoMdLink className="h-6 w-6 mr-2" />
                      <span>https://{profile[0]?.social?.others}.com</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
};

export default ProfileAside;
