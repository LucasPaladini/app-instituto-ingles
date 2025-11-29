document.addEventListener("DOMContentLoaded", () => {
    const tbodyCursos = document.querySelector(".tabla-cursos tbody");
    const contenedorAlumnos = document.querySelector(".tabla-alumnos-container");
    const cuerpoAlumnos = document.querySelector(".tabla-alumnos tbody");
    const inputCurso = document.getElementById("nombreCurso");
    const btnCrear = document.getElementById("crearCurso");

    // Función que carga todos los cursos
    async function cargarCursos() {
        const res = await fetch(`${api_url}/cursos`);
        const cursos = await res.json();

        // Limpiar tbody antes de agregar filas
        tbodyCursos.innerHTML = "";

        cursos.forEach(c => {
            const tr = document.createElement("tr");
            tr.dataset.nombre = c.nombre;

            tr.innerHTML = `
                <td>${c.nombre}</td>
                <td>
                    <button class="btn-modificar">✏️</button>
                    <button class="btn-eliminar">🗑️</button>
                </td>
            `;

            tbodyCursos.appendChild(tr);
        });

        // Ocultar alumnos mientras se cargan los cursos
        contenedorAlumnos.style.display = "none";
    }

    // Crear curso
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

    // Manejo de clicks dentro de la tabla
    tbodyCursos.addEventListener("click", async (e) => {
        const fila = e.target.closest("tr");
        if (!fila) return;

        const nombreCurso = fila.dataset.nombre;

        // Eliminar curso
        if (e.target.classList.contains("btn-eliminar")) {
            if (!confirm(`Eliminar curso "${nombreCurso}"?`)) return;
            await fetch(`${api_url}/cursos/${encodeURIComponent(nombreCurso)}`, { method: "DELETE" });
            cargarCursos();
            return;
        }

        // Modificar curso
        if (e.target.classList.contains("btn-modificar")) {
            const nuevo = prompt("Nuevo nombre:", nombreCurso);
            if (!nuevo) return;
            await fetch(`${api_url}/cursos/${encodeURIComponent(nombreCurso)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nuevo })
            });
            cargarCursos();
            return;
        }

        // Mostrar alumnos del curso
        tbodyCursos.querySelectorAll("tr").forEach(f => f.classList.remove("selected"));
        fila.classList.add("selected");

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
    });

    // Carga inicial
    cargarCursos();
});
