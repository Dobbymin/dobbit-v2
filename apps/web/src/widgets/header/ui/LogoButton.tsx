import Link from "next/link";

import { Button } from "@/shared/components/ui";
import { ROUTES_PATH } from "@/shared/constants";

export const LogoButton = () => {
  return (
    <Button asChild className='px-0 text-lg font-semibold' variant='link'>
      <Link href={ROUTES_PATH.HOME}>Dobbit</Link>
    </Button>
  );
};
