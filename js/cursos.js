document.addEventListener("DOMContentLoaded", () => {
    const filas = document.querySelectorAll(".tabla-cursos tbody tr");
    const tablaAlumnos = document.querySelector(".tabla-alumnos tbody");

    filas.forEach(fila => {
        fila.addEventListener("click", async () => {
            // Resaltar fila seleccionada
            filas.forEach(f => f.classList.remove("selected"));
            fila.classList.add("selected");

            const nombreCurso = fila.children[0].innerText;

            try {
                const res = await fetch(`http://127.0.0.1:5000/alumnos?curso=${nombreCurso}`);
                const alumnos = await res.json();

                // Llenar tabla de alumnos
                if (alumnos.length) {
                    tablaAlumnos.innerHTML = alumnos.map(a => `
                        <tr>
                            <td>${a.dni}</td>
                            <td>${a.nombre}</td>
                            <td>${a.curso}</td>
                            <td>${a.email}</td>
                        </tr>
                    `).join("");
                } else {
                    tablaAlumnos.innerHTML = `<tr><td colspan="4">No hay alumnos en este curso</td></tr>`;
                }
            } catch (error) {
                console.error("Error al cargar alumnos:", error);
                tablaAlumnos.innerHTML = `<tr><td colspan="4">Error al cargar alumnos</td></tr>`;
            }
        });
    });
});
