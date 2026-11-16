import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileView from "@/components/views/ProfileView";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileView />
    </ProtectedRoute>
  );
}
