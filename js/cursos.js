document.addEventListener("DOMContentLoaded", () => {
    const filas = document.querySelectorAll(".tabla-cursos tbody tr");
    const contenedor = document.querySelector(".tabla-alumnos");

    filas.forEach(fila => {
        fila.style.cursor = "pointer";
        fila.addEventListener("click", () => {
            const cursoSeleccionado = fila.children[0].innerText;

            // Filtrar alumnos
            const filtrados = alumnos.filter(a => a.curso === cursoSeleccionado);

            // Crear tabla
            contenedor.innerHTML = `
        <table class="tabla-alumnos">
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Curso</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            ${filtrados.map(a => `
              <tr>
                <td>${a.dni}</td>
                <td>${a.nombre}</td>
                <td>${a.curso}</td>
                <td>${a.email}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
        });
    });
});
