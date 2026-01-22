// src/components/HallCard.jsx
import PlaceList from "./PlaceList";

export default function HallCard({ hall }) {
    return (
        <div style={styles.card}>
            <h4>Hall {hall.nom}</h4>
            <Badge label={`Places: ${hall.nbrPlace}`} />
            <Badge label={`Libres: ${hall.placeLibre}`} />
            <Badge label={`Occupées: ${hall.placeOccupe}`} />

            <PlaceList places={hall.place} />
        </div>
    );
}

function Badge({ label }) {
    return <span style={styles.badge}>{label}</span>;
}

const styles = {
    card: {
        marginTop: "10px",
        padding: "12px",
        borderLeft: "4px solid #9b59b6",
        background: "#fff",
        borderRadius: "6px"
    },
    badge: {
        background: "#ddd",
        padding: "3px 6px",
        marginRight: "5px",
        borderRadius: "4px",
        fontSize: "12px"
    }
};
