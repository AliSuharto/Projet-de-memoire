// src/components/PlaceList.jsx
export default function PlaceList({ places }) {
    return (
        <div style={styles.container}>
            {places.map(place => (
                <span
                    key={place.id}
                    style={{
                        ...styles.place,
                        background: place.statut === "Libre" ? "#2ecc71" : "#e74c3c"
                    }}
                >
                    {place.nom}
                </span>
            ))}
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        marginTop: "10px"
    },
    place: {
        color: "white",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "12px"
    }
};
