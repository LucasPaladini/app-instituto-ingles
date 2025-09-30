document.addEventListener("DOMContentLoaded", () => {
    const resultado = document.getElementById("resultado");
    const dni = sessionStorage.getItem("dniSeleccionado");

    if (dni) {
        resultado.innerHTML = `
            <table border="1" style="border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th>DNI</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${dni}</td>
                    </tr>
                </tbody>
            </table>
        `;
    } else {
        resultado.innerHTML = "<p>No se seleccionó ningún alumno.</p>";
    }
});
