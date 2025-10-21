document.addEventListener("DOMContentLoaded", () => {
    const tablaAlumnos = document.querySelector(".tabla-alumnos tbody");
    const formContainer = document.getElementById("form-container");
    const btnMostrarForm = document.getElementById("boton-mostrar-form");
    const form = document.getElementById("form-alumno");

    // 🔹 Cargar alumnos desde backend
    async function cargarAlumnos() {
        try {
            const res = await fetch("http://127.0.0.1:5000/alumnos");
            const alumnos = await res.json();

            tablaAlumnos.innerHTML = alumnos.length
                ? alumnos.map(a => `
                    <tr>
                        <td>${a.dni}</td>
                        <td>${a.nombre}</td>
                        <td>${a.curso}</td>
                        <td>${a.email}</td>
                    </tr>
                  `).join("")
                : `<tr><td colspan="4">No hay alumnos cargados</td></tr>`;
        } catch (error) {
            console.error("Error al cargar alumnos:", error);
            tablaAlumnos.innerHTML = `<tr><td colspan="4">Error al cargar alumnos</td></tr>`;
        }
    }

    cargarAlumnos();

    // 🔹 Mostrar/ocultar formulario
    btnMostrarForm.addEventListener("click", () => {
        formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
        form.scrollIntoView({ behavior: "smooth" });
    });

    // 🔹 Agregar nuevo alumno
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevoAlumno = {
            dni: form.dni.value,
            nombre: form.nombre.value,
            curso: form.curso.value,
            email: form.email.value
        };

        try {
            const res = await fetch("http://127.0.0.1:5000/alumnos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevoAlumno)
            });

            const data = await res.json();
            if (res.ok) {
                alert("✅ " + data.mensaje);
                form.reset();
                formContainer.style.display = "none";
                cargarAlumnos(); // refresca tabla
            } else {
                alert("⚠️ " + (data.error || "No se pudo agregar"));
            }
        } catch (error) {
            console.error("Error al agregar alumno:", error);
            alert("⚠️ Error al agregar alumno");
        }
    });
});
