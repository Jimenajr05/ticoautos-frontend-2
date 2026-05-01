
import client from "./client";

export const validarMensajeChatAI = async (mensaje) => {
  const response = await client.post("/chat-ai/validar-mensaje", {
    mensaje,
  });

  return response.data;
};
