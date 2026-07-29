import { redirect } from "next/navigation";

import { TRADE_DEFAULT_PATH } from "@/shared";

export default function Page() {
  redirect(TRADE_DEFAULT_PATH);
}
