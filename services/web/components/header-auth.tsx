import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton({ isMobileSheet = false }: { isMobileSheet?: boolean }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className={`flex gap-4 items-center ${isMobileSheet ? 'flex-col items-start' : ''}`}>
        <div>
          <Badge variant={"default"} className="font-normal pointer-events-none">
            Please update .env.local file with anon key and url
          </Badge>
        </div>
        <div className={`flex gap-2 ${isMobileSheet ? 'flex-col w-full' : ''}`}>
          <Button
            asChild
            size="sm"
            variant={"outline"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={"default"}
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return user ? (
    <div className={`flex items-center gap-4 ${isMobileSheet ? 'flex-col items-start w-full' : ''}`}>
      <span className={isMobileSheet ? 'inline' : 'hidden lg:inline'}>Hey, {user.email}!</span>
      <form action={signOutAction} className={isMobileSheet ? 'w-full' : ''}>
        <Button type="submit" variant={"outline"} className={isMobileSheet ? 'w-full' : ''}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className={`flex gap-2 ${isMobileSheet ? 'flex-col w-full' : ''}`}>
      <Button asChild size="sm" variant={"outline"} className={isMobileSheet ? 'w-full' : ''}>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"} className={isMobileSheet ? 'w-full' : ''}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
