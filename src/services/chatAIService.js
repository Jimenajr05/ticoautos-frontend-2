import axios from "axios";

export const validarMensajeChatAI = async (mensaje) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "http://localhost:3000/api/chat-ai/validar-mensaje",
    {
      mensaje,
    },
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  return response.data;
};