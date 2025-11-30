document.addEventListener("DOMContentLoaded", () => {
    const tabla = document.querySelector(".tabla-alumnos tbody");
    const formAdd = document.getElementById("form-alumno");
    const formMod = document.getElementById("form-modificar");
    const contAdd = document.getElementById("form-container");
    const contMod = document.getElementById("form-modificar-container");

    // -----------------------------------
    // 🔹 Cargar cursos una sola vez
    // -----------------------------------
    let cursosCache = [];

    async function cargarCursos() {
        if (cursosCache.length === 0) {
            const res = await fetch(`${api_url}/cursos`);
            cursosCache = await res.json();
        }

        const selects = [
            document.getElementById("curso"),
            document.getElementById("mod-curso")
        ];

        selects.forEach(sel => {
            sel.innerHTML = `<option value="">Seleccione un curso</option>`;
            cursosCache.forEach(c => {
                const option = document.createElement("option");
                option.value = c.nombre.trim(); // trim para evitar espacios
                option.textContent = c.nombre;
                sel.appendChild(option);
            });
        });
    }

    cargarCursos();

    // -----------------------------------
    // 🔹 Listar alumnos
    // -----------------------------------
    async function cargarAlumnos() {
        const res = await fetch(`${api_url}/alumnos`);
        const alumnos = await res.json();

        tabla.innerHTML = alumnos.length
            ? alumnos.map(a => `
                <tr>
                    <td>${a.dni}</td>
                    <td>${a.nombre}</td>
                    <td>${a.apellido || ""}</td>
                    <td>${a.curso}</td>
                    <td>${a.email || ""}</td>
                    <td>${a.direccion || ""}</td>
                    <td><button class="boton-modificar" data-dni="${a.dni}">✏️ Modificar</button></td>
                    <td><button class="boton-eliminar" data-dni="${a.dni}">🗑 Eliminar</button></td>
                </tr>`).join("")
            : `<tr><td colspan="8">No hay alumnos cargados</td></tr>`;

        // Botones eliminar
        document.querySelectorAll(".boton-eliminar").forEach(btn =>
            btn.onclick = () => confirmarEliminar(btn.dataset.dni)
        );

        // Botones modificar
        document.querySelectorAll(".boton-modificar").forEach(btn =>
            btn.onclick = () => mostrarFormModificar(btn.dataset.dni)
        );
    }

    cargarAlumnos();

    // -----------------------------------
    // 🔹 Mostrar form Modificar
    // -----------------------------------
    async function mostrarFormModificar(dni) {
        // Traer datos del alumno usando la ruta correcta
        const res = await fetch(`${api_url}/alumnos/buscar?dni=${dni}`);
        const alumno = (await res.json())[0];
        if (!alumno) return;

        // Rellenar los campos
        document.getElementById("mod-dni").value = alumno.dni;
        document.getElementById("mod-nombre").value = alumno.nombre;
        document.getElementById("mod-apellido").value = alumno.apellido || "";
        document.getElementById("mod-email").value = alumno.email || "";
        document.getElementById("mod-direccion").value = alumno.direccion || "";

        // Primero cargar los cursos en el select
        await cargarCursos();

        // Seleccionar automáticamente el curso del alumno
        const selectCurso = document.getElementById("mod-curso");
        let encontrado = false;
        for (let opt of selectCurso.options) {
            if (opt.value.trim() === (alumno.curso || "").trim()) {
                opt.selected = true;
                encontrado = true;
                break;
            }
        }
        if (!encontrado) selectCurso.selectedIndex = 0;

        contMod.style.display = "block";
        formMod.scrollIntoView({ behavior: "smooth" });
    }

    // -----------------------------------
    // 🔹 Eliminar alumno
    // -----------------------------------
    function confirmarEliminar(dni) {
        if (!confirm(`¿Eliminar alumno ${dni}?`)) return;

        fetch(`${api_url}/alumnos/${dni}`, { method: "DELETE" })
            .then(() => cargarAlumnos());
    }

    // -----------------------------------
    // 🔹 Botón agregar (mostrar form)
    // -----------------------------------
    document.getElementById("boton-mostrar-form").onclick = async () => {
        await cargarCursos();
        contAdd.style.display = contAdd.style.display === "none" ? "block" : "none";
    };

    document.getElementById("boton-cancelar-agregar").onclick =
        () => (contAdd.style.display = "none");

    document.getElementById("boton-cancelar-modificar").onclick =
        () => (contMod.style.display = "none");

    // -----------------------------------
    // 🔹 AGREGAR alumno
    // -----------------------------------
    formAdd.onsubmit = e => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(formAdd).entries());

        fetch(`${api_url}/alumnos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(r => r.json())
            .then(res => {
                if (res.error) return alert(res.error);
                formAdd.reset();
                contAdd.style.display = "none";
                cargarAlumnos();
            });
    };

    // -----------------------------------
    // 🔹 MODIFICAR alumno
    // -----------------------------------
    formMod.onsubmit = e => {
        e.preventDefault();
        const dniOriginal = document.getElementById("mod-dni").value;
        const data = Object.fromEntries(new FormData(formMod).entries());
        delete data["mod-dni"];

        fetch(`${api_url}/alumnos/${dniOriginal}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(() => {
            formMod.reset();
            contMod.style.display = "none";
            cargarAlumnos();
        });
    };
});
