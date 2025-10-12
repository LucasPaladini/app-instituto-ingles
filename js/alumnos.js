document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector(".tabla-alumnos tbody");
    const formContainer = document.getElementById("form-container");
    const btnMostrarForm = document.getElementById("boton-mostrar-form");
    const form = document.getElementById("form-alumno");

    // Inicializar alumnos en localStorage si no existe
    if (!localStorage.getItem("alumnos")) {
        localStorage.setItem("alumnos", JSON.stringify(alumnos)); // alumnos viene de datos.js
    }

    let alumnosActuales = JSON.parse(localStorage.getItem("alumnos"));

    function renderAlumnos() {
        tbody.innerHTML = alumnosActuales.map(a => `
            <tr>
                <td>${a.dni}</td>
                <td>${a.nombre}</td>
                <td>${a.curso}</td>
                <td>${a.email}</td>
            </tr>
        `).join("");

        tbody.querySelectorAll("tr").forEach(fila => {
            fila.style.cursor = "pointer";
            fila.addEventListener("click", () => {
                sessionStorage.setItem("dniSeleccionado", fila.children[0].innerText);
                window.location.href = "libreta.html";
            });
        });
    }

    renderAlumnos();

    // Mostrar/ocultar formulario
    btnMostrarForm.addEventListener("click", () => {
        formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
        form.scrollIntoView({ behavior: "smooth" });
    });

    // Agregar nuevo alumno
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nuevoAlumno = {
            dni: form.dni.value,
            nombre: form.nombre.value,
            curso: form.curso.value,
            email: form.email.value
        };

        alumnosActuales.push(nuevoAlumno);
        localStorage.setItem("alumnos", JSON.stringify(alumnosActuales)); // guardar en localStorage
        renderAlumnos();
        form.reset();
    });
});
