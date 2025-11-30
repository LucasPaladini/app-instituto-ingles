document.addEventListener("DOMContentLoaded", () => {
    const tbodyCursos = document.querySelector(".tabla-cursos tbody");
    const inputCurso = document.getElementById("nombreCurso");
    const btnCrear = document.getElementById("crearCurso");

    // -----------------------------------
    // 🔹 Cargar cursos
    // -----------------------------------
    async function cargarCursos() {
        const res = await fetch(`${api_url}/cursos`);
        const cursos = await res.json();

        tbodyCursos.innerHTML = cursos.length
            ? cursos.map(c => `
                <tr data-nombre="${c.nombre}">
                    <td>${c.nombre}</td>
                    <td><button class="boton-modificar" data-nombre="${c.nombre}">✏️ Modificar</button></td>
                    <td><button class="boton-eliminar" data-nombre="${c.nombre}">🗑 Eliminar</button></td>
                </tr>`).join("")
            : `<tr><td colspan="3">No hay cursos cargados</td></tr>`;

        // Botones eliminar
        document.querySelectorAll(".boton-eliminar").forEach(btn =>
            btn.onclick = () => eliminarCurso(btn.dataset.nombre)
        );

        // Botones modificar
        document.querySelectorAll(".boton-modificar").forEach(btn =>
            btn.onclick = () => modificarCurso(btn.dataset.nombre)
        );
    }

    // -----------------------------------
    // 🔹 Crear curso
    // -----------------------------------
    btnCrear.addEventListener("click", async () => {
        const nombre = inputCurso.value.trim();
        if (!nombre) return alert("Ingrese un nombre");

        const res = await fetch(`${api_url}/cursos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre })
        });

        if (!res.ok) return alert("Error al crear curso");

        inputCurso.value = "";
        cargarCursos();
    });

    // -----------------------------------
    // 🔹 Funciones modificar/eliminar
    // -----------------------------------
    async function eliminarCurso(nombre) {
        if (!confirm(`Eliminar curso "${nombre}"?`)) return;
        await fetch(`${api_url}/cursos/${encodeURIComponent(nombre)}`, { method: "DELETE" });
        cargarCursos();
    }

    async function modificarCurso(nombre) {
        const nuevo = prompt("Nuevo nombre:", nombre);
        if (!nuevo) return;
        await fetch(`${api_url}/cursos/${encodeURIComponent(nombre)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevo })
        });
        cargarCursos();
    }

    cargarCursos();
});
