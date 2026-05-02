// Importa hooks de React
import { useEffect, useState } from "react";

// Importa herramientas de React Router
import { useSearchParams, useNavigate } from "react-router-dom";

// Importa el servicio para obtener información de un vehículo
import { getVehicleById } from "../services/vehicleService";

// Importa servicios relacionados con preguntas y conversaciones
import {
  getVehicleConversation,
  createQuestion,
  answerQuestion,
  getMyQuestions,
  getMyVehicleQuestions,
  deleteChatConversation,
} from "../services/questionService";

// OpenRouter AI para validar mensajes del chat
import { validarMensajeChatAI } from "../services/chatAIService";

// Obtiene el id del usuario desde el token JWT
const obtenerUsuarioIdDesdeToken = () => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || null;
  } catch (error) {
    return null;
  }
};

function Chat() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const vehicleId = searchParams.get("vehicleId");
  const rawAskedById = searchParams.get("askedBy");

  const userData =
    sessionStorage.getItem("user") ||
    sessionStorage.getItem("usuario") ||
    localStorage.getItem("user") ||
    localStorage.getItem("usuario");

  const user = userData ? JSON.parse(userData) : null;

  const token = sessionStorage.getItem("token") || localStorage.getItem("token");

  const currentUserId =
    user?._id || user?.id || user?.usuarioId || obtenerUsuarioIdDesdeToken();

  const askedById =
    rawAskedById &&
    rawAskedById !== "undefined" &&
    rawAskedById !== "null"
      ? rawAskedById
      : currentUserId;

  const chatBlockKey =
    vehicleId && askedById ? `chat-bloqueado-${vehicleId}-${askedById}` : null;

  const [vehicle, setVehicle] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [allChats, setAllChats] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [answerTexts, setAnswerTexts] = useState({});
  const [loading, setLoading] = useState(true);

  // Estado para mostrar mensajes dentro del bloque, sin alerts
  const [chatNotice, setChatNotice] = useState(null);

  // Estado para bloquear el chat si comparte información personal
  const [chatBlocked, setChatBlocked] = useState(false);

  // Estado para evitar doble envío
  const [sendingMessage, setSendingMessage] = useState(false);

  // Mensajes para respuestas del dueño
  const [answerNotices, setAnswerNotices] = useState({});

  useEffect(() => {
    if (!chatBlockKey) return;

    const savedBlock = sessionStorage.getItem(chatBlockKey);

    if (savedBlock) {
      const data = JSON.parse(savedBlock);
      setChatBlocked(true);
      setChatNotice({
        type: "error",
        text:
          data.razon ||
          "Este chat fue bloqueado porque se compartió información personal.",
      });
    } else {
      setChatBlocked(false);
      setChatNotice(null);
    }
  }, [chatBlockKey]);

  const bloquearChat = (razon) => {
    const mensaje =
      razon || "El mensaje contiene información personal y el chat fue bloqueado.";

    setChatBlocked(true);
    setChatNotice({
      type: "error",
      text: mensaje,
    });

    if (chatBlockKey) {
      sessionStorage.setItem(
        chatBlockKey,
        JSON.stringify({
          bloqueado: true,
          razon: mensaje,
        })
      );
    }
  };

  const loadConversationByVehicle = async () => {
    try {
      if (!vehicleId || !askedById) {
        console.warn("Faltan vehicleId o askedById para cargar la conversación.");
        setConversation([]);
        setVehicle(null);
        return;
      }

      setLoading(true);

      const vehicleData = await getVehicleById(vehicleId);
      const currentVehicle = vehicleData.data || null;
      setVehicle(currentVehicle);

      try {
        const conversationData = await getVehicleConversation(vehicleId, askedById);
        let chats = conversationData.data || [];

        chats = chats.filter((item) => {
          const currentAskedById =
            item.askedBy?._id || item.askedBy || item.user?._id || item.user;

          return currentAskedById === askedById;
        });

        chats.sort(
          (a, b) =>
            new Date(a.questionDate || a.createdAt) -
            new Date(b.questionDate || b.createdAt)
        );

        setConversation(chats);
      } catch (conversationError) {
        console.warn(
          "No se encontró conversación previa o hubo error al cargarla:",
          conversationError
        );
        setConversation([]);
      }
    } catch (error) {
      console.error("Error al cargar conversación:", error);
      setConversation([]);
      setVehicle(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAllChats = async () => {
    try {
      setLoading(true);

      const [myQuestionsData, myVehicleQuestionsData] = await Promise.all([
        getMyQuestions(),
        getMyVehicleQuestions(),
      ]);

      const sent = myQuestionsData.data || [];
      const received = myVehicleQuestionsData.data || [];
      const merged = [...received, ...sent];

      const groupedMap = new Map();

      merged.forEach((item) => {
        const currentVehicleId = item.vehicle?._id || item.vehicle;
        const currentAskedById =
          item.askedBy?._id || item.askedBy || item.user?._id || item.user;

        if (!currentVehicleId || !currentAskedById) return;

        const key = `${currentVehicleId}-${currentAskedById}`;
        const currentDate = new Date(item.questionDate || item.createdAt);

        if (!groupedMap.has(key)) {
          groupedMap.set(key, item);
        } else {
          const existing = groupedMap.get(key);
          const existingDate = new Date(existing.questionDate || existing.createdAt);

          if (currentDate > existingDate) {
            groupedMap.set(key, item);
          }
        }
      });

      const result = Array.from(groupedMap.values()).sort(
        (a, b) =>
          new Date(b.questionDate || b.createdAt) -
          new Date(a.questionDate || a.createdAt)
      );

      setAllChats(result);
    } catch (error) {
      console.error("Error al cargar chats:", error);
      setAllChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (
      vehicleId &&
      currentUserId &&
      (!rawAskedById ||
        rawAskedById === "undefined" ||
        rawAskedById === "null")
    ) {
      navigate(`/chat?vehicleId=${vehicleId}&askedBy=${currentUserId}`, {
        replace: true,
      });
      return;
    }

    if (vehicleId && askedById) {
      loadConversationByVehicle();
    } else {
      loadAllChats();
    }
  }, [vehicleId, rawAskedById, askedById, currentUserId, navigate, token]);

  const handleSendQuestion = async () => {
    setChatNotice(null);

    if (chatBlocked) {
      setChatNotice({
        type: "error",
        text: "Este chat está bloqueado. No puedes enviar más mensajes.",
      });
      return;
    }

    if (!vehicleId) {
      setChatNotice({
        type: "error",
        text: "No se encontró el vehículo para enviar el mensaje.",
      });
      return;
    }

    if (!currentUserId) {
      setChatNotice({
        type: "error",
        text: "Debes iniciar sesión para enviar mensajes.",
      });
      return;
    }

    if (!questionText.trim()) {
      setChatNotice({
        type: "warning",
        text: "El mensaje no puede estar vacío.",
      });
      return;
    }

    try {
      setSendingMessage(true);

      const validacion = await validarMensajeChatAI(questionText);

      if (!validacion.permitido) {
        bloquearChat(validacion.razon || "El mensaje no fue permitido.");
        return;
      }

      await createQuestion(vehicleId, questionText);

      setQuestionText("");

      setChatNotice({
        type: "success",
        text: "Mensaje enviado correctamente.",
      });

      if (!rawAskedById || rawAskedById === "undefined" || rawAskedById === "null") {
        navigate(`/chat?vehicleId=${vehicleId}&askedBy=${currentUserId}`, {
          replace: true,
        });
        return;
      }

      await loadConversationByVehicle();
    } catch (error) {
      if (error.response?.status === 403) {
        bloquearChat(
          error.response?.data?.razon ||
            error.response?.data?.mensaje ||
            "El mensaje no fue permitido."
        );
        return;
      }

      setChatNotice({
        type: "error",
        text: error.response?.data?.message || "Error al enviar el mensaje.",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendAnswer = async (questionId, fromList = false) => {
    const answer = answerTexts[questionId];

    setAnswerNotices((prev) => ({
      ...prev,
      [questionId]: null,
    }));

    if (chatBlocked) {
      setAnswerNotices((prev) => ({
        ...prev,
        [questionId]: {
          type: "error",
          text: "Este chat está bloqueado. No puedes enviar más mensajes.",
        },
      }));
      return;
    }

    if (!answer || !answer.trim()) {
      setAnswerNotices((prev) => ({
        ...prev,
        [questionId]: {
          type: "warning",
          text: "La respuesta no puede estar vacía.",
        },
      }));
      return;
    }

    try {
      const validacion = await validarMensajeChatAI(answer);

      if (!validacion.permitido) {
        bloquearChat(validacion.razon || "El mensaje no fue permitido.");

        setAnswerNotices((prev) => ({
          ...prev,
          [questionId]: {
            type: "error",
            text: validacion.razon || "El mensaje no fue permitido.",
          },
        }));

        return;
      }

      await answerQuestion(questionId, answer);

      setAnswerTexts((prev) => ({
        ...prev,
        [questionId]: "",
      }));

      setAnswerNotices((prev) => ({
        ...prev,
        [questionId]: {
          type: "success",
          text: "Respuesta enviada correctamente.",
        },
      }));

      if (fromList) {
        await loadAllChats();
      } else {
        await loadConversationByVehicle();
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const razon =
          error.response?.data?.razon ||
          error.response?.data?.mensaje ||
          "El mensaje no fue permitido.";

        bloquearChat(razon);

        setAnswerNotices((prev) => ({
          ...prev,
          [questionId]: {
            type: "error",
            text: razon,
          },
        }));

        return;
      }

      setAnswerNotices((prev) => ({
        ...prev,
        [questionId]: {
          type: "error",
          text: error.response?.data?.message || "Error al responder.",
        },
      }));
    }
  };

  const handleDeleteChat = async (vehicleIdToDelete, askedByIdToDelete) => {
    if (!vehicleIdToDelete || !askedByIdToDelete) {
      setChatNotice({
        type: "error",
        text: "No se pudo eliminar el chat porque faltan datos.",
      });
      return;
    }

    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este chat y todo su historial?"
    );

    if (!confirmDelete) return;

    try {
      await deleteChatConversation(vehicleIdToDelete, askedByIdToDelete);

      if (chatBlockKey) {
        sessionStorage.removeItem(chatBlockKey);
      }

      if (vehicleId && askedById) {
        navigate("/chat");
      } else {
        setAllChats((prev) =>
          prev.filter((item) => {
            const currentVehicleId = item.vehicle?._id || item.vehicle;
            const currentAskedById =
              item.askedBy?._id || item.askedBy || item.user?._id || item.user;

            return !(
              currentVehicleId === vehicleIdToDelete &&
              currentAskedById === askedByIdToDelete
            );
          })
        );
      }
    } catch (error) {
      console.error("Error al eliminar chat:", error);
      setChatNotice({
        type: "error",
        text: error.response?.data?.message || "Error al eliminar el chat.",
      });
    }
  };

  const NoticeBox = ({ notice }) => {
    if (!notice) return null;

    const styles = {
      error: "border-red-200 bg-red-50 text-red-700",
      warning: "border-amber-200 bg-amber-50 text-amber-700",
      success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };

    return (
      <div
        className={`mt-3 rounded-xl border px-4 py-3 text-sm font-medium ${
          styles[notice.type] || styles.warning
        }`}
      >
        {notice.text}
      </div>
    );
  };

  if (loading) {
    return <div className="p-10 text-center">Cargando chat...</div>;
  }

  if (!vehicleId || !askedById) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-slate-900">
            Chat con usuarios
          </h1>

          {allChats.length === 0 ? (
            <p className="text-slate-600">No tienes conversaciones todavía.</p>
          ) : (
            <div className="space-y-4">
              {allChats.map((item) => {
                const currentVehicleId = item.vehicle?._id || item.vehicle;
                const currentAskedById =
                  item.askedBy?._id || item.askedBy || item.user?._id || item.user;

                const vehicleTitle =
                  item.vehicle?.title ||
                  `${item.vehicle?.brand || ""} ${item.vehicle?.model || ""}`.trim() ||
                  "Vehículo";

                const userName = item.askedBy
                  ? `${item.askedBy.name || ""} ${item.askedBy.lastName || ""}`.trim()
                  : item.user
                  ? `${item.user.name || ""} ${item.user.lastName || ""}`.trim()
                  : "No disponible";

                const hasPendingAnswer = !item.answer;

                return (
                  <div
                    key={`${currentVehicleId}-${currentAskedById}-${item._id}`}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <p className="font-semibold text-slate-900">
                      Vehículo: {vehicleTitle}
                    </p>

                    <p className="mt-2 text-slate-700">
                      <span className="font-semibold">Usuario:</span> {userName}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.questionDate || item.createdAt
                        ? new Date(item.questionDate || item.createdAt).toLocaleString()
                        : ""}
                    </p>

                    <p className="mt-2 text-slate-700">
                      <span className="font-semibold">Último mensaje:</span>{" "}
                      {item.question || "Sin mensaje"}
                    </p>

                    {item.answer ? (
                      <p className="mt-2 text-slate-700">
                        <span className="font-semibold">Última respuesta:</span>{" "}
                        {item.answer}
                      </p>
                    ) : (
                      <>
                        <p className="mt-2 text-amber-600">Pendiente de respuesta</p>

                        {hasPendingAnswer && (
                          <div className="mt-4">
                            <textarea
                              value={answerTexts[item._id] || ""}
                              onChange={(e) =>
                                setAnswerTexts((prev) => ({
                                  ...prev,
                                  [item._id]: e.target.value,
                                }))
                              }
                              placeholder="Escribe tu respuesta..."
                              rows="3"
                              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                            />

                            <NoticeBox notice={answerNotices[item._id]} />

                            <button
                              onClick={() => handleSendAnswer(item._id, true)}
                              className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
                            >
                              Responder
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          if (!currentVehicleId || !currentAskedById) return;

                          navigate(
                            `/chat?vehicleId=${currentVehicleId}&askedBy=${currentAskedById}`
                          );
                        }}
                        className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                      >
                        Ver conversación
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteChat(currentVehicleId, currentAskedById)
                        }
                        className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                      >
                        Eliminar chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-10 text-center text-slate-600">
        No se encontró la conversación del vehículo.
      </div>
    );
  }

  const ownerId =
    vehicle.user?._id || vehicle.usuario?._id || vehicle.user || vehicle.usuario;

  const isOwner = currentUserId === ownerId;

  const lastMessage =
    conversation.length > 0 ? conversation[conversation.length - 1] : null;

  const canAsk = !isOwner && (!lastMessage || !!lastMessage.answer);
  const canAnswer = isOwner && lastMessage && !lastMessage.answer;

  const inputDisabled = !canAsk || chatBlocked || sendingMessage;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
              Chat con usuarios
            </h1>
            <p className="text-slate-600">
              Vehículo:{" "}
              <span className="font-semibold">
                {vehicle.title ||
                  `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() ||
                  "Vehículo"}
              </span>
            </p>
          </div>

          <button
            onClick={() => handleDeleteChat(vehicleId, askedById)}
            className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            Eliminar chat
          </button>
        </div>

        {!isOwner && (
          <div className="mb-8">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={
                chatBlocked
                  ? "Este chat fue bloqueado por compartir información personal"
                  : "Escribe tu mensaje al vendedor"
              }
              rows="4"
              disabled={inputDisabled}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                inputDisabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                  : "border-slate-300 focus:border-blue-500"
              }`}
            />

            <NoticeBox notice={chatNotice} />

            {!canAsk && !chatBlocked && (
              <p className="mt-2 text-sm text-amber-600">
                Debes esperar la respuesta del vendedor antes de enviar otro
                mensaje.
              </p>
            )}

            <button
              onClick={handleSendQuestion}
              disabled={inputDisabled}
              className={`mt-4 rounded-xl px-5 py-3 font-semibold text-white ${
                inputDisabled
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {chatBlocked
                ? "Chat bloqueado"
                : sendingMessage
                ? "Validando..."
                : "Enviar mensaje"}
            </button>
          </div>
        )}

        {conversation.length === 0 ? (
          <p className="text-slate-600">
            Aún no hay mensajes para este vehículo. Escribe el primero para
            iniciar la conversación.
          </p>
        ) : (
          <div className="space-y-6">
            {conversation.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <div className="mb-2">
                  <p className="font-semibold text-slate-900">
                    {item.askedBy?.name} {item.askedBy?.lastName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(item.questionDate || item.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-4 text-slate-800">
                  {item.question}
                </div>

                {item.answer ? (
                  <div className="mt-4">
                    <p className="mb-2 font-semibold text-slate-900">
                      Respuesta del vendedor
                    </p>
                    <div className="rounded-xl bg-blue-50 p-4 text-slate-800">
                      {item.answer}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {item.answerDate
                        ? new Date(item.answerDate).toLocaleString()
                        : ""}
                    </p>
                  </div>
                ) : isOwner && canAnswer && item._id === lastMessage?._id ? (
                  <div className="mt-4">
                    <textarea
                      value={answerTexts[item._id] || ""}
                      onChange={(e) =>
                        setAnswerTexts((prev) => ({
                          ...prev,
                          [item._id]: e.target.value,
                        }))
                      }
                      placeholder={
                        chatBlocked
                          ? "Este chat fue bloqueado por compartir información personal"
                          : "Escribe tu respuesta"
                      }
                      rows="3"
                      disabled={chatBlocked}
                      className={`w-full rounded-xl border px-4 py-3 outline-none ${
                        chatBlocked
                          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                          : "border-slate-300 focus:border-blue-500"
                      }`}
                    />

                    <NoticeBox notice={answerNotices[item._id] || chatNotice} />

                    <button
                      onClick={() => handleSendAnswer(item._id)}
                      disabled={chatBlocked}
                      className={`mt-3 rounded-xl px-5 py-3 font-semibold text-white ${
                        chatBlocked
                          ? "cursor-not-allowed bg-slate-400"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {chatBlocked ? "Chat bloqueado" : "Responder"}
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-amber-600">
                    Pendiente de respuesta del vendedor.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;