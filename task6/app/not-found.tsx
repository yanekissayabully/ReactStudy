import Link from "next/link";
import StateMessage from "@/components/StateMessage";

export default function NotFound() {
  return (
    <StateMessage
      title="404 — page not found"
      actions={
        <>
          <Link href="/" className="btn btnPrimary">
            Go home
          </Link>
          <Link href="/items" className="btn">
            All equipment
          </Link>
        </>
      }
    >
      The page you are looking for does not exist or was moved.
    </StateMessage>
  );
}
