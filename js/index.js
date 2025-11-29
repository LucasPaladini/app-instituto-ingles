document.addEventListener("DOMContentLoaded", () => {

    // Login alumno
    const formAlumno = document.getElementById("loginFormAlumno");
    if (formAlumno) {
        formAlumno.addEventListener("submit", async e => {
            e.preventDefault();
            const dni = document.getElementById("dniInputAlumno").value.trim();
            if (!dni) return alert("Ingrese su DNI");

            try {
                const res = await fetch(`${api_url}/alumnos/buscar?dni=${dni}`);
                const data = await res.json();

                if (data.length > 0) {
                    localStorage.setItem("dniAlumno", dni);
                    localStorage.setItem("rol", "alumno");
                    window.location.href = `pag/libreta.html`;
                } else {
                    alert("No se encontró el alumno");
                }
            } catch {
                alert("Error de conexión con el servidor");
            }
        });
    }
});
