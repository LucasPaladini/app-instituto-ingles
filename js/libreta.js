let notaEdit = null; // Nota que se está editando
let alumnoActual = null; // Alumno que estamos mostrando

// Buscar alumno por DNI
async function buscarDni() {
    const dni = document.getElementById("dniInput").value.trim();
    if (!dni) return alert("Ingrese un DNI");

    try {
        const res = await fetch("http://localhost:5000/alumnos");
        const alumnos = await res.json();
        const alumno = alumnos.find(a => a.dni === dni);
        alumnoActual = alumno; // Guardamos para usar al editar
        mostrarAlumno(alumno);
    } catch (err) {
        console.error(err);
        alert("Error obteniendo alumno");
    }
}

// Mostrar alumno y sus notas
function mostrarAlumno(alumno) {
    const resultado = document.getElementById("resultado");
    if (!alumno) {
        resultado.innerHTML = "<p style='color:white;'>Alumno no encontrado.</p>";
        return;
    }

    // Tabla info alumno
    let html = `
    <table class="tabla-alumnos">
        <thead>
            <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>${alumno.dni}</td>
                <td>${alumno.nombre} ${alumno.apellido}</td>
                <td>${alumno.email}</td>
            </tr>
        </tbody>
    </table>`;

    // Tabla notas
    if (alumno.notas && alumno.notas.length > 0) {
        html += `
        <table class="tabla-alumnos">
            <thead>
                <tr>
                    <th>Año</th>
                    <th>Curso</th>
                    <th>1er Trimestre</th>
                    <th>2do Trimestre</th>
                    <th>3er Trimestre</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${alumno.notas
            .sort((a,b)=>b.anio-a.anio)
            .map((n, idx) => `<tr>
                <td>${n.anio}</td>
                <td>${n.curso ?? alumno.curso}</td>
                <td>${n.trimestres["1er Trimestre"] ?? ""}</td>
                <td>${n.trimestres["2do Trimestre"] ?? ""}</td>
                <td>${n.trimestres["3er Trimestre"] ?? ""}</td>
                <td>
                    <button onclick="editarNota(${idx})">Editar</button>
                </td>
            </tr>`).join("")}
            </tbody>
        </table>`;
    } else {
        html += "<p style='color:white;'>Sin notas</p>";
    }

    resultado.innerHTML = html;
}

// Función que llama al modal con la nota a editar
function editarNota(idx) {
    const nota = alumnoActual.notas[idx];
    mostrarFormularioNotas(nota);
}

// Mostrar modal para agregar o editar nota
function mostrarFormularioNotas(editNota = null) {
    const dni = document.getElementById("dniInput").value.trim();
    if (!dni) return alert("Ingrese un DNI primero");

    notaEdit = editNota;

    const modal = document.getElementById("modal-notas");
    modal.style.display = "block";

    if (editNota) {
        document.getElementById("anioNota").value = editNota.anio;
        document.getElementById("cursoNota").value = editNota.curso;
        document.getElementById("trimestre1").value = editNota.trimestres["1er Trimestre"] ?? "";
        document.getElementById("trimestre2").value = editNota.trimestres["2do Trimestre"] ?? "";
        document.getElementById("trimestre3").value = editNota.trimestres["3er Trimestre"] ?? "";
    } else {
        document.getElementById("anioNota").value = "";
        document.getElementById("cursoNota").value = "";
        document.getElementById("trimestre1").value = "";
        document.getElementById("trimestre2").value = "";
        document.getElementById("trimestre3").value = "";
    }
}

// Cerrar modal
function cerrarFormularioNotas() {
    document.getElementById("modal-notas").style.display = "none";
    notaEdit = null;
}

// Guardar notas (agregar o editar)
async function agregarNotas() {
    const dni = document.getElementById("dniInput").value.trim();
    if (!dni) return alert("Ingrese un DNI");

    const anio = parseInt(document.getElementById("anioNota").value);
    if (!anio) return alert("Ingrese el año de la nota");

    const curso = document.getElementById("cursoNota").value.trim();
    if (!curso) return alert("Ingrese el curso");

    const trimestres = {};
    const t1 = document.getElementById("trimestre1").value;
    const t2 = document.getElementById("trimestre2").value;
    const t3 = document.getElementById("trimestre3").value;
    if(t1) trimestres["1er Trimestre"] = parseFloat(t1);
    if(t2) trimestres["2do Trimestre"] = parseFloat(t2);
    if(t3) trimestres["3er Trimestre"] = parseFloat(t3);

    if(!Object.keys(trimestres).length) return alert("Ingrese al menos una nota");

    try {
        const res = await fetch(`http://localhost:5000/alumnos/${dni}/notas`, {
            method:"PUT",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({anio, curso, trimestres})
        });
        const data = await res.json();
        alert(data.mensaje || "Notas agregadas correctamente");
        cerrarFormularioNotas();
    } catch(err){
        console.error(err);
        alert("Error conectando con el servidor");
    }
}
