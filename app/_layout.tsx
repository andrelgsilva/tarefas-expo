import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
   <Stack>
    <Stack.Screen name="index" options={{ title: "Home" }} />
    <Stack.Screen name="about" options={{ title: "--- Sobre ---" }} />
    <Stack.Screen name="tarefas/index" options={{ title: "Tarefas" }} />
    <Stack.Screen name="tarefas/[id]" options={{ title: "Editar Tarefa" }} />
  </Stack>
    </QueryClientProvider>
  );
}
