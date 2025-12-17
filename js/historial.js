// document.addEventListener("DOMContentLoaded", async () => {
//     const API_URL = `${api_url}/historial`;
//     const tbody = document.querySelector("#tabla-historial tbody");
//
//     try {
//         const res = await fetch(API_URL);
//         const data = await res.json();
//
//         tbody.innerHTML = data.length
//             ? data.map(item => `
//                 <tr>
//                     <td>${item.usuario || "-"}</td>
//                     <td>${item.accion}</td>
//                     <td>${item.entidad} (${item.entidadId || "-"})</td>
//                     <td>${new Date(item.fecha).toLocaleString()}</td>
//                     <td><pre>${item.cambios?.antes ? JSON.stringify(item.cambios.antes, null, 2) : "-"}</pre></td>
//                     <td><pre>${item.cambios?.despues ? JSON.stringify(item.cambios.despues, null, 2) : "-"}</pre></td>
//                 </tr>
//             `).join("")
//             : `<tr><td colspan="6">No hay historial</td></tr>`;
//
//     } catch (err) {
//         console.error("Error al cargar historial:", err);
//     }
// });
