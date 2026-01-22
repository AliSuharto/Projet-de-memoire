// src/api/marcheeApi.js
export async function getMarcheeInfo(id) {
    const response = await fetch(`http://localhost:8080/api/marchees/${id}/info`);
    if (!response.ok) {
        throw new Error("Erreur lors du chargement du marché");
    }
    return response.json();
}
