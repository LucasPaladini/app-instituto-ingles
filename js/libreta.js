// Función que muestra un alumno en la tabla
function mostrarAlumno(alumno) {
    const resultado = document.getElementById("resultado");

    if (!alumno) {
        resultado.innerHTML = "<p>Alumno no encontrado.</p>";
        return;
    }

    const notasTexto = alumno.notas
        ? Object.entries(alumno.notas)
            .map(([materia, nota]) => `${materia}: ${nota}`)
            .join(", ")
        : "Sin notas";

    resultado.innerHTML = `
        <table border="1" style="border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr>
                    <th>DNI</th>
                    <th>Nombre</th>
                    <th>Curso</th>
                    <th>Email</th>
                    <th>Notas</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${alumno.dni}</td>
                    <td>${alumno.nombre}</td>
                    <td>${alumno.curso}</td>
                    <td>${alumno.email}</td>
                    <td>${notasTexto}</td>
                </tr>
            </tbody>
        </table>
    `;
}

// Mostrar automáticamente el alumno seleccionado desde sessionStorage
document.addEventListener("DOMContentLoaded", () => {
    const dniSeleccionado = sessionStorage.getItem("dniSeleccionado");
    if (dniSeleccionado) {
        const alumno = alumnos.find(a => a.dni === dniSeleccionado);
        mostrarAlumno(alumno);
    }
});

// Reutilizamos la misma función para el input
function buscarDni() {
    const dni = document.getElementById("dniInput").value.trim();
    if (!dni) {
        alert("Ingrese un DNI.");
        return;
    }

    const alumno = alumnos.find(a => a.dni === dni);
    mostrarAlumno(alumno);
}
