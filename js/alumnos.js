document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector(".tabla-alumnos tbody");

    tbody.innerHTML = alumnos.map(a => `
        <tr>
            <td>${a.dni}</td>
            <td>${a.nombre}</td>
            <td>${a.curso}</td>
            <td>${a.email}</td>
        </tr>
    `).join("");

    // Agrega click a cada fila
    const filas = tbody.querySelectorAll("tr");
    filas.forEach(fila => {
        fila.style.cursor = "pointer"; // indica clickeable
        fila.addEventListener("click", () => {
            const dni = fila.children[0].innerText; // toma DNI
            sessionStorage.setItem("dniSeleccionado", dni); // guarda DNI
            window.location.href = "libreta.html"; // redirige
        });
    });
});