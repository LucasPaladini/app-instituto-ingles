document.addEventListener("DOMContentLoaded", () => {
    const filas = document.querySelectorAll(".tabla-cursos tbody tr");
    const contenedor = document.querySelector(".tabla-alumnos-container"); // Contenedor
    const tabla = document.querySelector(".tabla-alumnos");
    const cuerpo = tabla.querySelector("tbody");

    filas.forEach(fila => {
        fila.addEventListener("click", async () => {
            // Resaltar fila seleccionada
            filas.forEach(f => f.classList.remove("selected"));
            fila.classList.add("selected");

            const nombreCurso = fila.children[0].innerText;

            try {
                const res = await fetch(`${api_url}/alumnos?curso=${nombreCurso}`);
                const alumnos = await res.json();

                // Mostrar el contenedor
                contenedor.style.display = "block";

                cuerpo.innerHTML = alumnos.length
                    ? alumnos.map(a => `
                        <tr>
                            <td>${a.dni}</td>
                            <td>${a.nombre}</td>
                            <td>${a.apellido || ""}</td>
                            <td>${a.curso}</td>
                            <td>${a.email}</td>
                            <td>${a.direccion || ""}</td>
                        </tr>
                      `).join("")
                    : `<tr><td colspan="6">No hay alumnos en este curso</td></tr>`;
            } catch {
                contenedor.style.display = "block";
                cuerpo.innerHTML = `<tr><td colspan="6">Error al cargar alumnos</td></tr>`;
            }
        });
    });
});
