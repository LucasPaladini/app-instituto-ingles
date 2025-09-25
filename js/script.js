function botonIngresarMenu() {
    window.location.href = "pag/menu.html";

    // Acá va la validación desp
}



// Espera a que la página cargue
document.addEventListener("DOMContentLoaded", () => {
    // Selecciona todas las filas del tbody
    const filas = document.querySelectorAll("tbody tr");

    // Para cada fila, agrega un clic que abra libreta.html
    for (let i = 0; i < filas.length; i++) {
        filas[i].onclick = function() {
            let dni = filas[i].children[0].innerText; // toma el DNI de la primera celda
            sessionStorage.setItem("dniSeleccionado", dni); // guarda el DNI en sessionStorage
            window.location.href = "libreta.html"; // redirige a la página

        };
        filas[i].style.cursor = "pointer"; // que se vea que es clickeable
    }
    cargarDni(sessionStorage.getItem("dniSeleccionado"));
});


function cargarDni(dni) {
    document.getElementById("resultado").innerHTML = `
        <table border="1" style="border-collapse: collapse; margin-top: 10px;">
            <thead>
                <tr><th>DNI</th></tr>
            </thead>
            <tbody>
                <tr><td>${dni}</td></tr>
            </tbody>
        </table>
    `;
}

function buscarDni() {
    let dniIngresado = document.getElementById("dniInput").value;
    alert(dniIngresado);
}

