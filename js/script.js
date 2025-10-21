function botonIngresarMenu() {
    window.location.href = "pag/menu.html";

    // Acá va la validación desp
}

function buscarDni() {
    let dniIngresado = document.getElementById("dniInput").value;
    alert(dniIngresado);
}

// Obtener todos los alumnos
function cargarAlumnos() {
    fetch("http://localhost:5000/alumnos")
        .then(res => res.json())
        .then(data => {
            console.log("Alumnos:", data);
            const lista = document.getElementById("lista-alumnos");
            lista.innerHTML = "";
            data.forEach(alumno => {
                const li = document.createElement("li");
                li.textContent = `${alumno.nombre} - ${alumno.curso}`;
                lista.appendChild(li);
            });
        });
}

// Agregar un nuevo alumno
function agregarAlumno() {
    const nombre = document.getElementById("nombre").value;
    const curso = document.getElementById("curso").value;

    fetch("http://localhost:5000/alumnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, curso })
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            cargarAlumnos(); // Actualiza la lista
        });
}

// Llamar a cargarAlumnos al cargar la página
window.onload = cargarAlumnos;