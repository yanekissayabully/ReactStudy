import { Suspense } from "react";
import LoginView from "@/components/views/LoginView";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  // useSearchParams() (read inside LoginView) requires a Suspense boundary.
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
