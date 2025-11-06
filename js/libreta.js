document.addEventListener("DOMContentLoaded", () => {
    const resultado = document.getElementById("resultado");
    const modalNotas = document.getElementById("modal-notas");
    const botonAgregarNotas = document.getElementById("boton-agregar-notas");
    const botonCancelar = modalNotas.querySelector(".boton-cancelar-form");
    const botonGuardar = modalNotas.querySelector(".boton-guardar");
    const dniInput = document.getElementById("dniInput");
    const rol = localStorage.getItem("rol");


    if (rol !== "admin") {
        botonAgregarNotas.style.display = "none";
    }

    let alumnoActual = null;
    let notaEdit = null;

    // --- AUTO-CARGAR ALUMNO SI VIENE DEL LOGIN ---
    const dniAlumno = localStorage.getItem("dniAlumno");
    if (dniAlumno) {
        dniInput.value = dniAlumno;
        buscarDni(dniAlumno);
    }
    localStorage.clear()

    // Mostrar modal
    if (botonAgregarNotas) {
        botonAgregarNotas.addEventListener("click", () => {
            if (!alumnoActual) return alert("Primero consulte un alumno");
            notaEdit = null;
            limpiarFormularioNotas();
            modalNotas.style.display = "block";
        });
    }

    // Cerrar modal
    botonCancelar.addEventListener("click", () => modalNotas.style.display = "none");

    // Guardar nota
    botonGuardar.addEventListener("click", agregarNotas);

    // Consultar alumno desde input manual
    document.getElementById("boton-consultar").addEventListener("click", () => {
        const dni = dniInput.value.trim();
        if (!dni) return alert("Ingrese un DNI");
        buscarDni(dni);
    });

    async function buscarDni(dni) {
        try {
            const res = await fetch(`http://10.0.1.154:5000/alumnos/buscar?dni=${dni}`);
            const data = await res.json();

            if (data.length === 0) {
                resultado.innerHTML = "<p style='color:white;'>Alumno no encontrado</p>";
                alumnoActual = null;
                return;
            }

            alumnoActual = data[0];
            mostrarAlumno();
        } catch (err) {
            console.error(err);
            alert("Error obteniendo alumno");
        }
    }

    function mostrarAlumno() {
        if (!alumnoActual.notas) alumnoActual.notas = [];
        alumnoActual.notas.sort((a, b) => {
            if (a.anio > b.anio) return -1;
            if (a.anio < b.anio) return 1;
            return 0;
        });

        let html = `<table class="tabla-alumnos">
        <thead>
            <tr>
                <th>Año</th>
                <th>Curso</th>
                <th>1er Trimestre</th>
                <th>2do Trimestre</th>
                <th>3er Trimestre</th>
                ${rol === "admin" ? '<th colspan="2">Acciones</th>' : ''}
            </tr>
        </thead>
        <tbody>
        ${alumnoActual.notas.length
            ? alumnoActual.notas.map((n, idx) => `
                <tr>
                    <td>${n.anio}</td>
                    <td>${n.curso}</td>
                    <td>${n.trimestres["1er Trimestre"] ?? ""}</td>
                    <td>${n.trimestres["2do Trimestre"] ?? ""}</td>
                    <td>${n.trimestres["3er Trimestre"] ?? ""}</td>
                    ${rol === "admin" ? `
                    <td><button class="boton-eliminar" data-idx="${idx}">🗑️ Eliminar</button></td>
                    <td><button class="boton-modificar" data-idx="${idx}">✏️ Modificar</button></td>` : ''}
                </tr>`).join("")
            : `<tr><td colspan="${rol === 'admin' ? 7 : 5}" style="color:white;">Sin notas</td></tr>`}
        </tbody>
    </table>`;

        resultado.innerHTML = html;

        // Asignar eventos solo si es admin
        if (rol === "admin") {
            resultado.querySelectorAll(".boton-modificar").forEach(btn =>
                btn.addEventListener("click", () => editarNota(btn.dataset.idx))
            );
            resultado.querySelectorAll(".boton-eliminar").forEach(btn =>
                btn.addEventListener("click", () => eliminarNota(btn.dataset.idx))
            );
        }
    }

    function limpiarFormularioNotas() {
        document.getElementById("anioNota").value = "";
        document.getElementById("cursoNota").value = "";
        document.getElementById("trimestre1").value = "";
        document.getElementById("trimestre2").value = "";
        document.getElementById("trimestre3").value = "";
    }

    function editarNota(idx) {
        const nota = alumnoActual.notas[idx];
        notaEdit = idx;
        document.getElementById("anioNota").value = nota.anio;
        document.getElementById("cursoNota").value = nota.curso;
        document.getElementById("trimestre1").value = nota.trimestres["1er Trimestre"] ?? "";
        document.getElementById("trimestre2").value = nota.trimestres["2do Trimestre"] ?? "";
        document.getElementById("trimestre3").value = nota.trimestres["3er Trimestre"] ?? "";
        modalNotas.style.display = "block";
    }

    async function eliminarNota(idx) {
        if (!confirm("¿Seguro que desea eliminar esta nota?")) return;
        alumnoActual.notas.splice(idx, 1);

        try {
            await fetch(`http://10.0.1.154:5000/alumnos/${alumnoActual.dni}/notas`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notas: alumnoActual.notas })
            });
            mostrarAlumno();
        } catch (err) {
            console.error(err);
            alert("Error eliminando la nota");
        }
    }

    async function agregarNotas() {
        const t1 = parseFloat(document.getElementById("trimestre1").value);
        const t2 = parseFloat(document.getElementById("trimestre2").value);
        const t3 = parseFloat(document.getElementById("trimestre3").value);

        if ((t1 && t1 > 10) || (t2 && t2 > 10) || (t3 && t3 > 10)) {
            return alert("Las notas no pueden ser mayores a 10");
        }

        const anio = parseInt(document.getElementById("anioNota").value);
        const curso = document.getElementById("cursoNota").value.trim();

        if (!anio || !curso || (!t1 && !t2 && !t3))
            return alert("Complete todos los campos requeridos");

        if (anio < 2015 || anio > 2099)
            return alert("El año no puede ser menor a 2015 ni mayor a 2099");

        if (!notaEdit && alumnoActual.notas.find(n => n.anio === anio)) {
            return alert(`Ya existe una nota para el año ${anio}`);
        }

        const trimestres = {};
        if (!isNaN(t1)) trimestres["1er Trimestre"] = t1;
        if (!isNaN(t2)) trimestres["2do Trimestre"] = t2;
        if (!isNaN(t3)) trimestres["3er Trimestre"] = t3;

        const nuevaNota = { anio, curso, trimestres };

        if (notaEdit !== null) {
            alumnoActual.notas[notaEdit] = nuevaNota;
        } else {
            alumnoActual.notas.push(nuevaNota);
        }

        try {
            await fetch(`http://10.0.1.154:5000/alumnos/${alumnoActual.dni}/notas`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notas: alumnoActual.notas })
            });
            modalNotas.style.display = "none";
            limpiarFormularioNotas();
            mostrarAlumno();
        } catch (err) {
            console.error(err);
            alert("Error guardando nota");
        }
    }

    // --- LOGIN ALUMNO ---
    const formAlumno = document.getElementById("loginFormAlumno");
    if (formAlumno) {
        formAlumno.addEventListener("submit", e => {
            e.preventDefault();
            const dni = document.getElementById("dniInputAlumno").value.trim();

            if (dni) {
                localStorage.setItem("rol", "alumno");
                localStorage.setItem("dniAlumno", dni);
                window.location.href = "pag/libreta.html";
            }
        });
    }
});
