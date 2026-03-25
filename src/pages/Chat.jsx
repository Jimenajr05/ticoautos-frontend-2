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

// Componente principal del chat
function Chat() {

  // Obtiene los parámetros de la URL
  const [searchParams] = useSearchParams();

  // Hook para navegar entre páginas
  const navigate = useNavigate();

  // Obtiene el id del vehículo desde la URL
  const vehicleId = searchParams.get("vehicleId");

  // Obtiene el id del usuario que inició la conversación
  const askedById = searchParams.get("askedBy");

  // Estado para guardar el vehículo actual
  const [vehicle, setVehicle] = useState(null);

  // Estado para guardar la conversación actual
  const [conversation, setConversation] = useState([]);

  // Estado para guardar todos los chats del usuario
  const [allChats, setAllChats] = useState([]);

  // Estado para la nueva pregunta
  const [questionText, setQuestionText] = useState("");

  // Estado para guardar respuestas escritas, usando el id de la pregunta como clave
  const [answerTexts, setAnswerTexts] = useState({});

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Obtiene los datos del usuario guardados en sesión
  const userData = sessionStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  // Obtiene el token guardado en sesión
  const token = sessionStorage.getItem("token");

  // Carga la conversación de un vehículo específico
  const loadConversationByVehicle = async () => {
    try {
      // Verifica que existan los parámetros necesarios
      if (!vehicleId || !askedById) {
        console.warn("Faltan vehicleId o askedById para cargar la conversación.");
        setConversation([]);
        setVehicle(null);
        return;
      }

      setLoading(true);

      // Obtiene los datos del vehículo
      const vehicleData = await getVehicleById(vehicleId);
      const currentVehicle = vehicleData.data || null;
      setVehicle(currentVehicle);

      try {
        // Obtiene la conversación del vehículo con ese usuario
        const conversationData = await getVehicleConversation(vehicleId, askedById);
        let chats = conversationData.data || [];

        // Filtra los mensajes para que solo sean de ese usuario
        chats = chats.filter((item) => {
          const currentAskedById =
            item.askedBy?._id || item.askedBy || item.user?._id || item.user;
          return currentAskedById === askedById;
        });

        // Ordena la conversación de más antigua a más reciente
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

  // Carga todos los chats del usuario
  const loadAllChats = async () => {
    try {
      setLoading(true);

      // Obtiene las preguntas hechas por el usuario y las preguntas recibidas en sus vehículos
      const [myQuestionsData, myVehicleQuestionsData] = await Promise.all([
        getMyQuestions(),
        getMyVehicleQuestions(),
      ]);

      const sent = myQuestionsData.data || [];
      const received = myVehicleQuestionsData.data || [];
      const merged = [...received, ...sent];

      // Mapa para agrupar conversaciones por vehículo + usuario
      const groupedMap = new Map();

      merged.forEach((item) => {
        const currentVehicleId = item.vehicle?._id || item.vehicle;
        const currentAskedById =
          item.askedBy?._id || item.askedBy || item.user?._id || item.user;

        if (!currentVehicleId || !currentAskedById) return;

        const key = `${currentVehicleId}-${currentAskedById}`;
        const currentDate = new Date(item.questionDate || item.createdAt);

        // Si no existe la conversación, la agrega
        if (!groupedMap.has(key)) {
          groupedMap.set(key, item);
        } else {
          // Si ya existe, deja el mensaje más reciente
          const existing = groupedMap.get(key);
          const existingDate = new Date(existing.questionDate || existing.createdAt);

          if (currentDate > existingDate) {
            groupedMap.set(key, item);
          }
        }
      });

      // Convierte el mapa en arreglo y lo ordena de más reciente a más antiguo
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


  // Se ejecuta al cargar el componente o cuando cambian parámetros importantes
  useEffect(() => {

    // Si no hay token, redirige al login
    if (!token) {
      alert("Debes iniciar sesión para ver tus chats.");
      navigate("/login");
      return;
    }

    // Si hay vehicleId y askedById, carga una conversación específica
    if (vehicleId && askedById) {
      loadConversationByVehicle();
    } else {
      // Si no, carga la lista general de chats
      loadAllChats();
    }
  }, [vehicleId, askedById, navigate, token]);

  // Envía una nueva pregunta
  const handleSendQuestion = async () => {

    // Verifica que exista el vehículo
    if (!vehicleId) {
      alert("No se encontró el vehículo para enviar la pregunta.");
      return;
    }

    // Verifica que el mensaje no esté vacío
    if (!questionText.trim()) {
      alert("La pregunta no puede estar vacía.");
      return;
    }

    try {
      // Crea la pregunta
      await createQuestion(vehicleId, questionText);
      // Limpia el campo
      setQuestionText("");
      // Recarga la conversación
      await loadConversationByVehicle();
    } catch (error) {
      alert(error.response?.data?.message || "Error al enviar pregunta.");
    }
  };

  // Envía una respuesta a una pregunta
  const handleSendAnswer = async (questionId, fromList = false) => {
    const answer = answerTexts[questionId];

    // Verifica que la respuesta no esté vacía
    if (!answer || !answer.trim()) {
      alert("La respuesta no puede estar vacía.");
      return;
    }

    try {
      // Envía la respuesta al backend
      await answerQuestion(questionId, answer);

      // Limpia el campo de texto de esa respuesta
      setAnswerTexts((prev) => ({
        ...prev,
        [questionId]: "",
      }));

      // Recarga según el contexto
      if (fromList) {
        await loadAllChats();
      } else {
        await loadConversationByVehicle();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error al responder.");
    }
  };

  // Elimina una conversación completa
  const handleDeleteChat = async (vehicleIdToDelete, askedByIdToDelete) => {

    // Verifica que existan los datos necesarios
    if (!vehicleIdToDelete || !askedByIdToDelete) {
      alert("No se pudo eliminar el chat porque faltan datos.");
      return;
    }

    // Confirmación antes de eliminar
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este chat y todo su historial?"
    );

    if (!confirmDelete) return;

    try {
      // Elimina la conversación
      await deleteChatConversation(vehicleIdToDelete, askedByIdToDelete);

      // Si estaba dentro de una conversación específica, vuelve a la lista
      if (vehicleId && askedById) {
        navigate("/chat");
      } else {

        // Si está en la lista, la actualiza localmente
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

      alert("Chat eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar chat:", error);
      alert(error.response?.data?.message || "Error al eliminar el chat.");
    }
  };

  // Vista mientras carga
  if (loading) {
    return <div className="p-10 text-center">Cargando chat...</div>;
  }

  // Vista de lista general de chats
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

                // Obtiene el nombre del vehículo
                const vehicleTitle =
                  item.vehicle?.title ||
                  `${item.vehicle?.brand || ""} ${item.vehicle?.model || ""}`.trim() ||
                  "Vehículo";

                // Obtiene el nombre del usuario
                const userName = item.askedBy
                  ? `${item.askedBy.name || ""} ${item.askedBy.lastName || ""}`.trim()
                  : item.user
                  ? `${item.user.name || ""} ${item.user.lastName || ""}`.trim()
                  : "No disponible";

                // Indica si hay respuesta pendiente
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
                          if (!currentVehicleId || !currentAskedById) {
                            alert("No se puede abrir esta conversación.");
                            return;
                          }

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

  // Si no se encontró el vehículo relacionado
  if (!vehicle) {
    return (
      <div className="p-10 text-center text-slate-600">
        No se encontró la conversación del vehículo.
      </div>
    );
  }

  // Obtiene el id del propietario del vehículo
  const ownerId = vehicle.user?._id || vehicle.usuario?._id || vehicle.user || vehicle.usuario;

  // Verifica si el usuario actual es el dueño
  const isOwner = user?._id === ownerId;

  // Obtiene el último mensaje de la conversación
  const lastMessage =
    conversation.length > 0 ? conversation[conversation.length - 1] : null;

  // El comprador puede preguntar solo si no es dueño y la última pregunta ya fue respondida
  const canAsk = !isOwner && (!lastMessage || !!lastMessage.answer);

  // El dueño puede responder si el último mensaje no tiene respuesta
  const canAnswer = isOwner && lastMessage && !lastMessage.answer;

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

         {/* Caja para enviar pregunta si el usuario no es dueño */}
        {!isOwner && (
          <div className="mb-8">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Escribe tu mensaje al vendedor"
              rows="4"
              disabled={!canAsk}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            {!canAsk && (
              <p className="mt-2 text-sm text-amber-600">
                Debes esperar la respuesta del vendedor antes de enviar otro
                mensaje.
              </p>
            )}

            <button
              onClick={handleSendQuestion}
              disabled={!canAsk}
              className={`mt-4 rounded-xl px-5 py-3 font-semibold text-white ${
                canAsk
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-400"
              }`}
            >
              Enviar mensaje
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
                      placeholder="Escribe tu respuesta"
                      rows="3"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={() => handleSendAnswer(item._id)}
                      className="mt-3 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
                    >
                      Responder
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