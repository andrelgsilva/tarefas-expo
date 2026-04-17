import { atualizarDescricao, deletarTarefa, getTarefas } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditarTarefaPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["tarefas"],
    queryFn: getTarefas,
  });

  const tarefa = data?.find((t) => t.objectId === id || String(t.id) === String(id));
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");

  const mutationAtualizar = useMutation({
    mutationFn: atualizarDescricao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      router.back();
    },
  });

  const mutationDeletar = useMutation({
    mutationFn: deletarTarefa,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarefas"] });
      router.replace("/");
    },
  });

  function handleSalvar() {
    if (descricao.trim() === "") {
      Alert.alert("Descrição inválida", "Preencha a descrição da tarefa");
      return;
    }
    if (Platform.OS === "web") {
      const confirmado = window.confirm(`Deseja salvar "${descricao}"?`);
      if (confirmado) mutationAtualizar.mutate({ id, descricao });
    } else {
      Alert.alert("Confirmar alteração", `Deseja salvar "${descricao}"?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Salvar", onPress: () => mutationAtualizar.mutate({ id, descricao }) },
      ]);
    }
  }

  function handleDeletar() {
    if (Platform.OS === "web") {
      const confirmado = window.confirm(`Deseja apagar "${tarefa?.descricao}"?`);
      if (confirmado) mutationDeletar.mutate(id);
    } else {
      Alert.alert("Confirmar exclusão", `Deseja apagar "${tarefa?.descricao}"?`, [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => mutationDeletar.mutate(id) },
      ]);
    }
  }

  const isPending = mutationAtualizar.isPending || mutationDeletar.isPending;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {isPending && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#111" />
        </View>
      )}

      <View style={styles.idBadge}>
        <Text style={styles.idText}>#{id}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição da tarefa"
          placeholderTextColor="#AAA"
          multiline
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.saveButton, isPending && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={isPending}
        >
          {mutationAtualizar.isPending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, isPending && styles.buttonDisabled]}
          onPress={handleDeletar}
          disabled={isPending}
        >
          {mutationDeletar.isPending ? (
            <ActivityIndicator size="small" color="#C0392B" />
          ) : (
            <Text style={styles.deleteButtonText}>Apagar tarefa</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backButton, isPending && styles.buttonDisabled]}
          onPress={() => router.back()}
          disabled={isPending}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  loadingBar: {
    alignItems: "center",
  },
  idBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  idText: {
    fontSize: 12,
    color: "#888",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
  },
  input: {
    borderWidth: 0.5,
    borderColor: "#CCC",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#FFF",
    minHeight: 52,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: "#111",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "500",
  },
  deleteButton: {
    borderWidth: 0.5,
    borderColor: "#FFCCCC",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#C0392B",
    fontSize: 15,
    fontWeight: "500",
  },
  backButton: {
    borderWidth: 0.5,
    borderColor: "#CCC",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#888",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});