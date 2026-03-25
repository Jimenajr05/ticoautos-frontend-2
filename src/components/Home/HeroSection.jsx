// Importa Link para navegar entre páginas sin recargar
import { Link } from "react-router-dom";

// Componente de sección principal (Hero) de la página pública
function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
                        Encuentra tu próximo vehículo en TicoAutos
                    </h1>
                    <p className="mt-4 text-lg text-slate-200"> Explora vehículos disponibles y comparte el enlace público fácilmente.</p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link to="/register" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
                            Crear cuenta
                        </Link>
                        <Link to="/login" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20">
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;