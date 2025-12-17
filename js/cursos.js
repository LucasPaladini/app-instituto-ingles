document.addEventListener("DOMContentLoaded", () => {
    const tbodyCursos = document.querySelector(".tabla-cursos tbody");
    const contenedorAlumnos = document.querySelector(".tabla-alumnos-container");
    const cuerpoAlumnos = document.querySelector(".tabla-alumnos tbody");
    const inputCurso = document.getElementById("nombreCurso");
    const btnCrear = document.getElementById("crearCurso");
    const usuario = sessionStorage.getItem("usuarioLogueado");

    // Cargar cursos
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

        // Asignar click a fila para mostrar alumnos
        tbodyCursos.querySelectorAll("tr").forEach(fila => {
            fila.onclick = async (e) => {
                // Evitar que click en botón active la fila
                if (e.target.tagName === "BUTTON") return;

                const nombreCurso = fila.dataset.nombre;

                // Resaltar fila seleccionada
                tbodyCursos.querySelectorAll("tr").forEach(f => f.classList.remove("selected"));
                fila.classList.add("selected");

                // Traer alumnos
                const alumnos = await (await fetch(`${api_url}/alumnos?curso=${encodeURIComponent(nombreCurso)}`)).json();
                contenedorAlumnos.style.display = "block";

                cuerpoAlumnos.innerHTML = alumnos.length
                    ? alumnos.map(a => `
                        <tr>
                            <td>${a.dni}</td>
                            <td>${a.nombre}</td>
                            <td>${a.apellido || ""}</td>
                            <td>${a.curso}</td>
                            <td>${a.email || ""}</td>
                            <td>${a.direccion || ""}</td>
                        </tr>`).join("")
                    : `<tr><td colspan="6">No hay alumnos en este curso</td></tr>`;
            };
        });

        // Ocultar alumnos si no hay cursos
        if (!cursos.length) contenedorAlumnos.style.display = "none";
    }

    // Crear curso
    btnCrear.addEventListener("click", async () => {
        const nombre = inputCurso.value.trim();
        if (!nombre) return alert("Ingrese un nombre");

        const res = await fetch(`${api_url}/cursos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, usuario })  // <-- enviamos el usuario
        });

        if (!res.ok) return alert("Error al crear curso");
        inputCurso.value = "";
        cargarCursos();
    });


    // Modificar curso
    async function modificarCurso(nombre) {
        const nuevo = prompt("Nuevo nombre:", nombre);
        if (!nuevo) return;
        await fetch(`${api_url}/cursos/${encodeURIComponent(nombre)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nuevo, usuario })
        });
        cargarCursos();
    }

// Eliminar curso
    async function eliminarCurso(nombre) {
        if (!confirm(`Eliminar curso "${nombre}"?`)) return;
        await fetch(`${api_url}/cursos/${encodeURIComponent(nombre)}?usuario=${usuario}`, { method: "DELETE" });
        cargarCursos();
    }

    // Carga inicial
    cargarCursos();
});