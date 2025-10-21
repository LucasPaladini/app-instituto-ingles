document.addEventListener("DOMContentLoaded", () => {
    const filas = document.querySelectorAll(".tabla-cursos tbody tr");
    const tabla = document.querySelector(".tabla-alumnos");
    const cuerpo = tabla.querySelector("tbody");

    tabla.style.display = "none";

    filas.forEach(fila => {
        fila.addEventListener("click", async () => {
            filas.forEach(f => f.classList.remove("selected"));
            fila.classList.add("selected");

            const nombreCurso = fila.children[0].innerText;

            try {
                const res = await fetch(`http://127.0.0.1:5000/alumnos?curso=${nombreCurso}`);
                const alumnos = await res.json();

                tabla.style.display = "table";
                cuerpo.innerHTML = alumnos.length
                    ? alumnos.map(a => `
                        <tr>
                            <td>${a.dni}</td>
                            <td>${a.nombre}</td>
                            <td>${a.curso}</td>
                            <td>${a.email}</td>
                        </tr>
                      `).join("")
                    : `<tr><td colspan="4">No hay alumnos en este curso</td></tr>`;
            } catch {
                cuerpo.innerHTML = `<tr><td colspan="4">Error al cargar alumnos</td></tr>`;
                tabla.style.display = "table";
            }
        });
    });
});
