import { useState } from "react";
import { register, getPadronInfo, googleAuth } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        cedula: "",
        name: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        profileImage: null
    });

    const [googleCredential, setGoogleCredential] = useState("");
    const [showGoogleExtraForm, setShowGoogleExtraForm] = useState(false);
    const [googleUser, setGoogleUser] = useState(null);
    const [googleForm, setGoogleForm] = useState({
        cedula: "",
        phone: "",
        name: "",
        lastName: ""
    });

    const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "profileImage") {
        setForm((prev) => ({
            ...prev,
            profileImage: files[0]
        }));
        return;
    }

    setForm((prev) => ({
        ...prev,
        [name]: value
    }));

    if (name === "cedula" && value.length === 9) {
        try {
            console.log("Consultando padrón con:", value);
            const data = await getPadronInfo(value);
            console.log("Respuesta padrón completa:", JSON.stringify(data, null, 2));
            console.log("name:", data.name);
            console.log("lastName:", data.lastName);

            setForm((prev) => ({
                ...prev,
                cedula: value,
                name: data.name || "",
                lastName: data.lastName || ""
            }));
        } catch (error) {
            console.error("Error consultando padrón:", error.response?.data || error.message);

            setForm((prev) => ({
                ...prev,
                cedula: value,
                name: "",
                lastName: ""
            }));
        }
    }

    if (name === "cedula" && value.length < 9) {
        setForm((prev) => ({
            ...prev,
            cedula: value,
            name: "",
            lastName: ""
        }));
    }
};

    const handleGoogleFormChange = async (e) => {
        const { name, value } = e.target;

        setGoogleForm((prev) => ({
            ...prev,
            [name]: value
        }));

        if (name === "cedula" && value.length === 9) {
            try {
                const data = await getPadronInfo(value);

                setGoogleForm((prev) => ({
                    ...prev,
                    cedula: value,
                    name: data.name || "",
                    lastName: data.lastName || ""
                }));
            } catch (error) {
                setGoogleForm((prev) => ({
                    ...prev,
                    cedula: value,
                    name: "",
                    lastName: ""
                }));
            }
        }

        if (name === "cedula" && value.length < 9) {
            setGoogleForm((prev) => ({
                ...prev,
                cedula: value,
                name: "",
                lastName: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();

            formData.append("cedula", form.cedula);
            formData.append("phone", form.phone);
            formData.append("email", form.email);
            formData.append("password", form.password);

            if (form.profileImage) {
                formData.append("profileImage", form.profileImage);
            }

            const data = await register(formData);

            alert(data.message || "Registro correcto");
            navigate("/login");
        } catch (error) {
            alert(error.response?.data?.message || "Error al registrar");
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const data = await googleAuth({
                credential: credentialResponse.credential
            });

            if (data.requiresCedula) {
                setGoogleCredential(credentialResponse.credential);
                setGoogleUser(data.googleUser);
                setShowGoogleExtraForm(true);
                return;
            }

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            alert(data.message || "Inicio con Google correcto");
            navigate("/home");
        } catch (error) {
            alert(error.response?.data?.message || "Error al iniciar con Google");
        }
    };

    const handleCompleteGoogleRegister = async (e) => {
        e.preventDefault();

        try {
            const data = await googleAuth({
                credential: googleCredential,
                cedula: googleForm.cedula,
                phone: googleForm.phone
            });

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));
            alert(data.message || "Registro con Google correcto");
            navigate("/home");
        } catch (error) {
            alert(error.response?.data?.message || "Error al completar el registro con Google");
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200 sm:p-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900">Crear cuenta</h2>
                    <p className="mt-2 text-slate-500">
                        Registra un nuevo usuario en el sistema TicoAutos
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Cédula
                        </label>
                        <input
                            type="text"
                            name="cedula"
                            value={form.cedula}
                            onChange={handleChange}
                            required
                            maxLength={9}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Teléfono
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Nombre
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            readOnly
                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={form.lastName}
                            readOnly
                            className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Foto de perfil
                        </label>
                        <input
                            type="file"
                            name="profileImage"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"
                        >
                            Registrarse
                        </button>
                    </div>

                    <div className="md:col-span-2 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => alert("Error al iniciar con Google")}
                        />
                    </div>

                    <div className="md:col-span-2 text-center text-sm text-slate-600">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </div>
                </form>

                {showGoogleExtraForm && (
                    <form
                        onSubmit={handleCompleteGoogleRegister}
                        className="mt-8 grid gap-5 rounded-2xl border border-slate-200 p-6 md:grid-cols-2"
                    >
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold text-slate-900">
                                Completar registro con Google
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Correo detectado: {googleUser?.email}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Cédula
                            </label>
                            <input
                                type="text"
                                name="cedula"
                                value={googleForm.cedula}
                                onChange={handleGoogleFormChange}
                                required
                                maxLength={9}
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Teléfono
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={googleForm.phone}
                                onChange={handleGoogleFormChange}
                                required
                                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={googleForm.name}
                                readOnly
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Apellidos
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={googleForm.lastName}
                                readOnly
                                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-green-600 px-4 py-3 text-white transition hover:bg-green-700"
                            >
                                Completar registro con Google
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Register;