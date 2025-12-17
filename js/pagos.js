document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector(".tabla-pagos tbody");
    const anioSel = document.getElementById("anio");
    const meses = ["marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
    const anioActual = new Date().getFullYear();

    for (let a = 2023; a <= 2030; a++)
        anioSel.innerHTML += `<option value="${a}" ${a === anioActual ? "selected" : ""}>${a}</option>`;

    const cargarPagos = async () => {
        const res = await fetch(`${api_url}/pagos?anio=${anioSel.value}`);
        const data = await res.json();

        tbody.innerHTML = data.map(a => `
            <tr>
                <td>${a.dni}</td>
                <td>${a.apellido}</td>
                <td>${a.nombre}</td>
                ${meses.map(m => `
                    <td><input type="checkbox"
                        ${a.meses[m] ? "checked" : ""}
                        onchange="actualizarPago('${a.dni}','${m}',this.checked)">
                    </td>`).join("")}
            </tr>
        `).join("");
    };

    window.actualizarPago = (dni, mes, valor) =>
        fetch(`${api_url}/pagos/${dni}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mes, valor, anio: Number(anioSel.value) })
        });

    anioSel.onchange = cargarPagos;
    cargarPagos();
});
