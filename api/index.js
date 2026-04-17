import axios from "axios";

const urlBase = "https://api-tarefas-five.vercel.app/tarefas";

export async function getTarefas() {
  const response = await axios.get(urlBase);
  return response.data;
}

export async function adicionarTarefa({ descricao }) {
  const response = await axios.post(urlBase, {
    descricao,
    concluida: false,
  });
  return response.data;
}

export async function atualizarTarefa({ id, concluida }) {
  const response = await axios.put(`${urlBase}/${id}`, { concluida });
  return response.data;
}

export async function deletarTarefa(id) {
  const response = await axios.delete(`${urlBase}/${id}`);
  return response.data;
}

export async function atualizarDescricao({ id, descricao }) {
  const response = await axios.put(`${urlBase}/${id}`, { descricao });
  return response.data;
}