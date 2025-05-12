import { Redirect } from "expo-router";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function Index() {
  const user = useProtectedRoute();
  if (!user) return null;
  console.log(user);
  return (
    <Redirect href="/(home)" />
  );
}

