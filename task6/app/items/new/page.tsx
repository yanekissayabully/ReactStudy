import ProtectedRoute from "@/components/ProtectedRoute";
import { NewItemView } from "@/components/views/ItemFormView";

export default function NewItemPage() {
  return (
    <ProtectedRoute>
      <NewItemView />
    </ProtectedRoute>
  );
}
