// Componente para manejar la paginación de la lista de vehículos
function Pagination({ pagination, onPageChange }) {

    // Si solo hay una página, no se muestra la paginación
    if (pagination.totalPages <= 1) return null;

    return (
        <div className="mt-10 flex justify-center gap-3">
            <button onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="rounded-xl bg-white px-4 py-2 font-medium text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Anterior
            </button>

            <span className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">
                Página {pagination.currentPage} de {pagination.totalPages}
            </span>

            <button onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages}className="rounded-xl bg-white px-4 py-2 font-medium text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
                Siguiente
            </button>
        </div>
    );
}

export default Pagination;