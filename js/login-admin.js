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
                const res = await fetch("http://192.168.1.30:5000/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({dni, password: pass})
                });
                const data = await res.json();

                localStorage.setItem("rol", "admin");
                if (data.success) window.location.href = "../pag/menu.html";
                else errorMsg.style.display = "block";
            } catch {
                alert("Error de conexión con el servidor");
            }
        });
    }
});