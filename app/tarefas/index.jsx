import { adicionarTarefa, atualizarTarefa, getTarefas, deletarTarefa } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TarefasPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isFetching } = useQuery({
    queryKey: ["tarefas"],
    queryFn: getTarefas,
  });

  const mutationAdicionar = useMutation({
    mutationFn: adicionarTarefa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefas"] }),
  });

  const mutationAtualizar = useMutation({
    mutationFn: atualizarTarefa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefas"] }),
  });

  const mutationRemover = useMutation({
    mutationFn: deletarTarefa,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tarefas"] }),
    onError: (error) => {
      console.log("erro ao deletar:", error);
      Alert.alert("Erro", error.message);
    },
  });

  const [descricao, setDescricao] = useState("");

  function handleAdicionarTarefaPress() {
    console.log("handle chamado, descricao:", descricao);
    if (descricao.trim() === "") {
      Alert.alert("Descrição inválida", "Preencha a descrição da tarefa", [
        { text: "OK" },
      ]);
      return;
    }
    mutationAdicionar.mutate({ descricao });
    setDescricao("");
  }

  function handleToggleConcluida(tarefa) {
    mutationAtualizar.mutate({
      id: tarefa.id,
      concluida: !tarefa.concluida,
    });
  }

  function handleRemover(tarefa) {
    if (Platform.OS === "web") {
      const confirmado = window.confirm(`Deseja apagar "${tarefa.descricao}"?`);
      if (confirmado) mutationRemover.mutate(tarefa.id);
    } else {
      Alert.alert(
        "Apagar tarefa",
        `Deseja apagar "${tarefa.descricao}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Apagar",
            style: "destructive",
            onPress: () => mutationRemover.mutate(tarefa.id),
          },
        ]
      );
    }
  }

  const isPending =
    isFetching ||
    mutationAdicionar.isPending ||
    mutationAtualizar.isPending ||
    mutationRemover.isPending;

  return (
    <View style={styles.container}>
      {isPending && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#111" />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nova tarefa..."
          placeholderTextColor="#AAA"
          value={descricao}
          onChangeText={setDescricao}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            mutationAdicionar.isPending && styles.addButtonDisabled,
          ]}
          onPress={handleAdicionarTarefaPress}
          disabled={mutationAdicionar.isPending}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {data?.map((t) => (
          <View key={t.id} style={styles.taskItem}>
            <Switch
              value={!!t.concluida}
              onValueChange={() => handleToggleConcluida(t)}
              disabled={mutationAtualizar.isPending || mutationRemover.isPending}
              trackColor={{ false: "#E0E0E0", true: "#111" }}
              thumbColor="#FFF"
              ios_backgroundColor="#E0E0E0"
            />

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => router.push(`/tarefas/${t.id}`)}
            >
              <Text style={[styles.taskText, t.concluida && styles.taskTextDone]}>
                {t.descricao}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemover(t)}
              disabled={mutationRemover.isPending}
            >
              <TrashIcon />
            </TouchableOpacity>
          </View>
        ))}

        {data?.length === 0 && (
          <Text style={styles.emptyText}>Nenhuma tarefa encontrada</Text>
        )}
      </ScrollView>
    </View>
  );
}

function TrashIcon() {
  return (
    <View style={{ width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: 14, height: 2, backgroundColor: "#C0392B", borderRadius: 1, marginBottom: 2 }} />
      <View style={{ width: 11, height: 12, borderWidth: 1.5, borderColor: "#C0392B", borderRadius: 2, borderTopWidth: 0 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  loadingBar: {
    alignItems: "center",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#CCC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#FFF",
  },
  addButton: {
    backgroundColor: "#111",
    borderRadius: 12,
    width: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#888",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 26,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 4,
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 0.5,
    borderColor: "#EBEBEB",
    marginBottom: 4,
  },
  taskText: {
    fontSize: 15,
    color: "#111",
  },
  taskTextDone: {
    color: "#AAA",
    textDecorationLine: "line-through",
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#BBB",
    fontSize: 14,
    marginTop: 40,
  },
});