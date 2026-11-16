import { Suspense } from "react";
import SignupView from "@/components/views/SignupView";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <Suspense>
      <SignupView />
    </Suspense>
  );
}
