import Image from "next/image";
import Link from "next/link";

import { ROUTES_PATH } from "@/shared";

export const LogoButton = () => {
  return (
    <Link className='flex items-center gap-2 justify-self-start' href={ROUTES_PATH.HOME}>
      <Image src='/logo.svg' alt='Dobbit' width={20} height={20} priority />
      <span className='text-base leading-tight font-bold text-white'>Dobbit</span>
    </Link>
  );
};
