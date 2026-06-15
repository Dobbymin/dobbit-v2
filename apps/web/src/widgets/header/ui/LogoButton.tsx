import Link from "next/link";

import { Button, ROUTES_PATH } from "@/shared";

export const LogoButton = () => {
  return (
    <Button asChild className='px-0 text-lg font-semibold' variant='link'>
      <Link href={ROUTES_PATH.HOME}>Dobbit</Link>
    </Button>
  );
};
