import React, { useEffect, useState } from "react";

type Marchand = {
    id: number;
    nom: string;
    // autres propriétés
};

type Marche = {
    id: number;
    nom: string;
    // autres propriétés
};

type Place = {
    id: number;
    numero: string;
    etat: "libre" | "occupee";
    marchandId?: number;
    marcheId: number;
};

const DashboardPage = () => {
    const [marchands, setMarchands] = useState<Marchand[]>([]);
    const [marches, setMarches] = useState<Marche[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Remplacez ces URLs par vos endpoints réels
        Promise.all([
            fetch("/api/marchands").then(res => res.json()),
            fetch("/api/marches").then(res => res.json()),
            fetch("/api/places").then(res => res.json()),
        ]).then(([marchandsData, marchesData, placesData]) => {
            setMarchands(marchandsData);
            setMarches(marchesData);
            setPlaces(placesData);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Chargement...</div>;

    return (
        <div>
            <h1>Dashboard</h1>
            <section>
                <h2>Marchands</h2>
                <ul>
                    {marchands.map(m => (
                        <li key={m.id}>{m.nom}</li>
                    ))}
                </ul>
            </section>
            <section>
                <h2>Marchés</h2>
                <ul>
                    {marches.map(m => (
                        <li key={m.id}>{m.nom}</li>
                    ))}
                </ul>
            </section>
            <section>
                <h2>Places</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Numéro</th>
                            <th>État</th>
                            <th>Marchand</th>
                            <th>Marché</th>
                        </tr>
                    </thead>
                    <tbody>
                        {places.map(place => (
                            <tr key={place.id}>
                                <td>{place.numero}</td>
                                <td>{place.etat}</td>
                                <td>
                                    {place.marchandId
                                        ? marchands.find(m => m.id === place.marchandId)?.nom
                                        : "Libre"}
                                </td>
                                <td>
                                    {marches.find(m => m.id === place.marcheId)?.nom || ""}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default DashboardPage;