document.addEventListener("DOMContentLoaded", () => {

    // --- LOGIN ADMIN ---
    const formAdmin = document.getElementById("loginFormAdmin");
    if (formAdmin) {
        formAdmin.addEventListener("submit", async e => {
            e.preventDefault();
            const dni = document.getElementById("dniInputAdmin").value.trim();
            const pass = document.getElementById("passInputAdmin").value.trim();
            const errorMsg = document.getElementById("loginError");

            try {
                const res = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dni, password: pass })
                });
                const data = await res.json();

                if (data.success) window.location.href = "../pag/menu.html";
                else errorMsg.style.display = "block";
            } catch {
                alert("Error de conexión con el servidor");
            }
        });
    }

    // --- LOGIN ALUMNO ---
    const formAlumno = document.getElementById("loginFormAlumno");
    if (formAlumno) {
        formAlumno.addEventListener("submit", async e => {
            e.preventDefault();
            const dni = document.getElementById("dniInputAlumno").value.trim();

            if (!dni) return alert("Ingrese su DNI");

            try {
                const res = await fetch(`http://localhost:5000/alumnos/buscar?dni=${dni}`);
                const data = await res.json();

                if (data.length > 0)
                    window.location.href = `pag/libreta.html?dni=${dni}`;
                else
                    alert("No se encontró el alumno");
            } catch {
                alert("Error de conexión con el servidor");
            }
        });
    }

});
