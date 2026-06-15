import Image from "next/image";
import Link from "next/link";

import { ROUTES_PATH } from "@/shared";

export const LogoButton = () => {
  return (
    <Link className='flex items-center gap-4 justify-self-start' href={ROUTES_PATH.HOME}>
      <Image src='/logo.svg' alt='Dobbit' width={24} height={24} priority />
      <span className='text-xl leading-tight font-bold text-white'>Dobbit</span>
    </Link>
  );
};
