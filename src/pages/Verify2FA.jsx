import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verify2FA, resend2FA } from "../services/authService";

/**
 * Componente para la pantalla de verificación de (2FA).
 * Requiere que el usuario ingrese un código de 6 dígitos que se le envió por SMS.
 * Tiene un temporizador para la expiración del código y una opción para reenviarlo.
*/
function Verify2FA() {
    const navigate = useNavigate();
    const location = useLocation();

    const userId = location.state?.userId || "";
    const expiresAt = location.state?.expiresAt || null;

    const [codigo, setCodigo] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!userId) {
            navigate("/login");
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (!expiresAt) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const end = new Date(expiresAt).getTime();
            const difference = end - now;

            if (difference <= 0) {
                setTimeLeft("El código expiró");
                return;
            }

            const minutes = Math.floor(difference / 1000 / 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    /**
     * Maneja el envío del código 2FA ingresado por el usuario.
     * Lo valida en el backend y si es correcto  guarda la sesión y redirige al home.
    */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            setLoading(true);

            const data = await verify2FA({
                usuarioId: userId,
                codigo
            });

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.usuario));

            navigate("/home");
        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Error al verificar el código");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Solicita al backend que reenvíe un nuevo código SMS al usuario.
     */
    const handleResend = async () => {
        setErrorMsg("");
        try {
            setResending(true);

            const data = await resend2FA({
                userId
            });

        } catch (error) {
            setErrorMsg(error.response?.data?.message || "Error al reenviar el código");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200">
                <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900">
                        Verificación 2FA
                    </h2>
                    <p className="mt-2 text-slate-500">
                        Ingresa el código enviado por mensaje de texto
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Código de verificación
                        </label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            maxLength={6}
                            required
                            placeholder="Ejemplo: 123456"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg tracking-[0.3em] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div className="text-center text-sm text-slate-500">
                        Tiempo restante: <span className="font-semibold">{timeLeft}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Verificando..." : "Verificar código"}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-4 w-full rounded-xl bg-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {resending ? "Reenviando..." : "Reenviar código"}
                </button>

                {errorMsg && (
                    <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600">
                        {errorMsg}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Verify2FA;