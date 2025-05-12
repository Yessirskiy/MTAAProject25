import { Redirect } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function Index() {
  const user = useProtectedRoute();
  if (!user) return null;
  if (user.is_admin){
    return (
      <Redirect href="/(admin_home)"/>
    )
  }
  return (
    <Redirect href="/(home)" />
  );
}

