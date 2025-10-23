document.addEventListener("DOMContentLoaded", () => {
    const tablaAlumnos = document.querySelector(".tabla-alumnos tbody");
    const formAgregarContainer = document.getElementById("form-container");
    const formModificarContainer = document.getElementById("form-modificar-container");
    const formAgregar = document.getElementById("form-alumno");
    const formModificar = document.getElementById("form-modificar");
    const btnMostrarForm = document.getElementById("boton-mostrar-form");

    async function cargarAlumnos() {
        try {
            const res = await fetch("http://127.0.0.1:5000/alumnos");
            const alumnos = await res.json();

            tablaAlumnos.innerHTML = alumnos.length
                ? alumnos.map(a => `
                    <tr>
                        <td>${a.dni}</td>
                        <td>${a.nombre}</td>
                        <td>${a.apellido || ""}</td>
                        <td>${a.curso}</td>
                        <td>${a.email}</td>
                        <td>${a.direccion || ""}</td>
                        <td><button class="boton-eliminar" data-dni="${a.dni}">🗑️ Eliminar</button></td>
                        <td><button class="boton-modificar" data-dni="${a.dni}">✏️ Modificar</button></td>
                    </tr>`).join("")
                : `<tr><td colspan="8">No hay alumnos cargados</td></tr>`;

            document.querySelectorAll(".boton-eliminar").forEach(btn => {
                btn.onclick = async () => {
                    const dni = btn.dataset.dni;
                    if (confirm(`¿Eliminar al alumno con DNI ${dni}?`)) await eliminarAlumno(dni);
                };
            });

            document.querySelectorAll(".boton-modificar").forEach(btn => {
                btn.onclick = () => {
                    const fila = btn.closest("tr");
                    formModificar.querySelector("#mod-dni").value = fila.children[0].textContent;
                    formModificar.querySelector("#mod-nombre").value = fila.children[1].textContent;
                    formModificar.querySelector("#mod-apellido").value = fila.children[2].textContent;
                    formModificar.querySelector("#mod-curso").value = fila.children[3].textContent;
                    formModificar.querySelector("#mod-email").value = fila.children[4].textContent;
                    formModificar.querySelector("#mod-direccion").value = fila.children[5].textContent;
                    formModificarContainer.style.display = "block";
                    formModificar.scrollIntoView({ behavior: "smooth" });
                };
            });

        } catch {
            tablaAlumnos.innerHTML = `<tr><td colspan="8">Error al cargar alumnos</td></tr>`;
        }
    }

    cargarAlumnos();

    btnMostrarForm.addEventListener("click", () => {
        formAgregarContainer.style.display = formAgregarContainer.style.display === "none" ? "block" : "none";
        formAgregar.scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("btn-cancelar-agregar").addEventListener("click", () => {
        formAgregarContainer.style.display = "none";
    });

    document.getElementById("btn-cancelar-modificar").addEventListener("click", () => {
        formModificarContainer.style.display = "none";
    });

    formAgregar.addEventListener("submit", async e => {
        e.preventDefault();
        const alumno = {
            dni: formAgregar.querySelector("#dni").value,
            nombre: formAgregar.querySelector("#nombre").value,
            apellido: formAgregar.querySelector("#apellido").value,
            curso: formAgregar.querySelector("#curso").value,
            email: formAgregar.querySelector("#email").value,
            direccion: formAgregar.querySelector("#direccion").value
        };
        try {
            const res = await fetch("http://127.0.0.1:5000/alumnos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alumno)
            });
            if (res.ok) {
                formAgregar.reset();
                formAgregarContainer.style.display = "none";
                cargarAlumnos();
            } else {
                alert("Error al agregar alumno");
            }
        } catch {
            alert("Error al agregar alumno");
        }
    });

    formModificar.addEventListener("submit", async e => {
        e.preventDefault();
        const dni = formModificar.querySelector("#mod-dni").value;
        const alumno = {
            nombre: formModificar.querySelector("#mod-nombre").value,
            apellido: formModificar.querySelector("#mod-apellido").value,
            curso: formModificar.querySelector("#mod-curso").value,
            email: formModificar.querySelector("#mod-email").value,
            direccion: formModificar.querySelector("#mod-direccion").value
        };
        try {
            const res = await fetch(`http://127.0.0.1:5000/alumnos/${dni}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alumno)
            });
            if (res.ok) {
                formModificar.reset();
                formModificarContainer.style.display = "none";
                cargarAlumnos();
            } else {
                alert("Error al modificar alumno");
            }
        } catch {
            alert("Error al modificar alumno");
        }
    });

    async function eliminarAlumno(dni) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/alumnos/${dni}`, { method: "DELETE" });
            if (res.ok) cargarAlumnos();
            else alert("Error al eliminar alumno");
        } catch {
            alert("Error al eliminar alumno");
        }
    }
});
