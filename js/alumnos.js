document.addEventListener("DOMContentLoaded", () => {
    const tablaAlumnos = document.querySelector(".tabla-alumnos tbody");
    const formContainer = document.getElementById("form-container");
    const btnMostrarForm = document.getElementById("boton-mostrar-form");
    const form = document.getElementById("form-alumno");


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
                <td><button class="boton-eliminar" data-dni="${a.dni}">🗑️ Eliminar</button></td>
                <td><button class="boton-modificar" data-dni="${a.dni}">✏️ Modificar</button></td>
            </tr>
          `).join("")
                : `<tr><td colspan="6">No hay alumnos cargados</td></tr>`;

            // 🔹 Eventos eliminar
            document.querySelectorAll(".boton-eliminar").forEach(btn => {
                btn.onclick = async () => {
                    const dni = btn.dataset.dni;
                    if (confirm(`¿Seguro que querés eliminar al alumno con DNI ${dni}?`)) {
                        await eliminarAlumno(dni);
                    }
                };
            });

            // 🔹 Eventos modificar (ahora funciona)
            document.querySelectorAll(".boton-modificar").forEach(btn => {
                btn.onclick = async () => {
                    const fila = btn.closest("tr");
                    const dni = fila.children[0].textContent;
                    const nombre = fila.children[1].textContent;
                    const curso = fila.children[2].textContent;
                    const email = fila.children[3].textContent;

                    const nuevoNombre = prompt("Nuevo nombre:", nombre);
                    const nuevoCurso = prompt("Nuevo curso:", curso);
                    const nuevoEmail = prompt("Nuevo email:", email);

                    if (nuevoNombre && nuevoCurso && nuevoEmail) {
                        await fetch(`http://127.0.0.1:5000/alumnos/${dni}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nombre: nuevoNombre, curso: nuevoCurso, email: nuevoEmail })
                        });
                        cargarAlumnos();
                    }
                };
            });

        } catch (error) {
            console.error("Error al cargar alumnos:", error);
            tablaAlumnos.innerHTML = `<tr><td colspan="6">Error al cargar alumnos</td></tr>`;
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

    async function eliminarAlumno(dni) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/alumnos/${dni}`, {
                method: "DELETE"
            });
            const data = await res.json();

            if (res.ok) {
                alert("🗑️ " + data.mensaje);
                cargarAlumnos();
            } else {
                alert("⚠️ " + (data.error || "No se pudo eliminar el alumno"));
            }
        } catch (error) {
            console.error("Error al eliminar alumno:", error);
            alert("⚠️ Error al eliminar alumno");
        }
    }

    // Después de cargar la tabla
    document.querySelectorAll(".boton-modificar").forEach(btn => {
        btn.onclick = async () => {
            const fila = btn.closest("tr");
            const dni = fila.children[0].textContent; // DNI no se toca
            const nombre = fila.children[1].textContent;
            const curso = fila.children[2].textContent;
            const email = fila.children[3].textContent;

            const nuevoNombre = prompt("Nuevo nombre:", nombre);
            const nuevoCurso = prompt("Nuevo curso:", curso);
            const nuevoEmail = prompt("Nuevo email:", email);

            if (nuevoNombre && nuevoCurso && nuevoEmail) {
                await fetch(`http://127.0.0.1:5000/alumnos/${dni}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre: nuevoNombre, curso: nuevoCurso, email: nuevoEmail })
                });
                cargarAlumnos();
            }
        };
    });

});
