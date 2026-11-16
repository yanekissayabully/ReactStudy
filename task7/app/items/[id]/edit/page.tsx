import ProtectedRoute from "@/components/ProtectedRoute";
import { EditItemView } from "@/components/views/ItemFormView";

export default function EditItemPage() {
  return (
    <ProtectedRoute>
      <EditItemView />
    </ProtectedRoute>
  );
}
