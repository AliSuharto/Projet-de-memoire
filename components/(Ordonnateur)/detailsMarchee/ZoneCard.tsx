// src/components/ZoneCard.jsx
import HallCard from "./HallCard";
import PlaceList from "./PlaceList";

export default function ZoneCard({ zone }) {
    return (
        <div style={styles.card}>
            <h3>Zone {zone.nom}</h3>
            <Badge label={`Places: ${zone.nbrPlace}`} />
            <Badge label={`Libres: ${zone.placeLibre}`} />
            <Badge label={`Occupées: ${zone.placeOccupe}`} />

            {zone.hall.map(hall => (
                <HallCard key={hall.id} hall={hall} />
            ))}

            <PlaceList places={zone.place} />
        </div>
    );
}

function Badge({ label }) {
    return <span style={styles.badge}>{label}</span>;
}

const styles = {
    card: {
        padding: "15px",
        marginBottom: "15px",
        borderLeft: "4px solid #3498db",
        background: "#fff",
        borderRadius: "8px"
    },
    badge: {
        background: "#ddd",
        padding: "3px 6px",
        marginRight: "5px",
        borderRadius: "4px",
        fontSize: "12px"
    }
};
