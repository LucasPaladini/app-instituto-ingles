document.addEventListener("DOMContentLoaded", () => {
    const tablaAlumnos = document.querySelector(".tabla-alumnos tbody");
    const formAgregarContainer = document.getElementById("form-container");
    const formModificarContainer = document.getElementById("form-modificar-container");
    const formAgregar = document.getElementById("form-alumno");
    const formModificar = document.getElementById("form-modificar");
    const botonMostrarForm = document.getElementById("boton-mostrar-form");

    async function cargarAlumnos() {
        try {
            const res = await fetch("http://192.168.1.30:5000/alumnos");
            const alumnos = await res.json();
            tablaAlumnos.innerHTML = alumnos.length
                ? alumnos.map(a => `
                    <tr>
                        <td>${a.dni}</td>
                        <td>${a.nombre}</td>
                        <td>${a.apellido || ""}</td>
                        <td>${a.curso}</td>
                        <td>${a.email || ""}</td>
                        <td>${a.direccion || ""}</td>
                        <td><button class="boton-eliminar" data-dni="${a.dni}">🗑️ Eliminar</button></td>
                        <td><button class="boton-modificar" data-dni="${a.dni}">✏️ Modificar</button></td>
                    </tr>`).join("")
                : `<tr><td colspan="8">No hay alumnos cargados</td></tr>`;

            tablaAlumnos.querySelectorAll(".boton-eliminar").forEach(btn =>
                btn.onclick = async () => {
                    if (confirm(`¿Eliminar al alumno con DNI ${btn.dataset.dni}?`))
                        await eliminarAlumno(btn.dataset.dni);
                }
            );

            tablaAlumnos.querySelectorAll(".boton-modificar").forEach(btn =>
                btn.onclick = () => {
                    const fila = btn.closest("tr");
                    ["dni","nombre","apellido","curso","email","direccion"].forEach((id,i) => {
                        const input = formModificar.querySelector(`#mod-${id}`);
                        if(input) input.value = fila.children[i].textContent;
                    });
                    formModificarContainer.style.display = "block";
                    formModificar.scrollIntoView({ behavior: "smooth" });
                }
            );

        } catch {
            tablaAlumnos.innerHTML = `<tr><td colspan="8">Error al cargar alumnos</td></tr>`;
        }
    }

    cargarAlumnos();

    botonMostrarForm.addEventListener("click", () => {
        formAgregarContainer.style.display = formAgregarContainer.style.display === "none" ? "block" : "none";
        formAgregar.scrollIntoView({ behavior: "smooth" });
    });

    document.getElementById("boton-cancelar-agregar").onclick = () => formAgregarContainer.style.display = "none";
    document.getElementById("boton-cancelar-modificar").onclick = () => formModificarContainer.style.display = "none";

    formAgregar.addEventListener("submit", async e => {
        e.preventDefault();
        const alumno = Object.fromEntries(new FormData(formAgregar).entries());
        try {
            const res = await fetch(`http://192.168.1.30:5000/alumnos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alumno)
            });
            const data = await res.json();
            if (res.ok) {
                formAgregar.reset();
                formAgregarContainer.style.display = "none";
                cargarAlumnos();
            } else {
                alert(data.error === "El DNI ya existe" ? "Ese DNI ya está registrado" : data.error || "Error al agregar alumno");
            }
        } catch {
            alert("Error de conexión al agregar alumno");
        }
    });

    formModificar.addEventListener("submit", async e => {
        e.preventDefault();
        const dni = formModificar.querySelector("#mod-dni").value;
        const alumno = Object.fromEntries(new FormData(formModificar).entries());
        delete alumno.mod_dni; // no enviamos el DNI
        try {
            const res = await fetch(`http://192.168.1.30:5000/alumnos/${dni}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(alumno)
            });
            if (res.ok) {
                formModificar.reset();
                formModificarContainer.style.display = "none";
                cargarAlumnos();
            } else {
                const data = await res.json();
                alert(data.error || "Error al modificar alumno");
            }
        } catch {
            alert("Error de conexión al modificar alumno");
        }
    });

    async function eliminarAlumno(dni) {
        try {
            const res = await fetch(`http://192.168.1.30:5000/alumnos/${dni}`, { method: "DELETE" });
            if (res.ok) cargarAlumnos();
            else alert("Error al eliminar alumno");
        } catch {
            alert("Error de conexión al eliminar alumno");
        }
    }
});
