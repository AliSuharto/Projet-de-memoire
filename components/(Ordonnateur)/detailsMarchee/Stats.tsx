// src/components/Stats.jsx
export default function Stats({ data }) {
    return (
        <div style={styles.stats}>
            <StatBox title="Total Places" value={data.nbrPlace} color="#3498db" />
            <StatBox title="Places Libres" value={data.placeLibre} color="#2ecc71" />
            <StatBox title="Places Occupées" value={data.placeOccupe} color="#e74c3c" />
            <StatBox title="Taux Occupation" value={`${data.occupationRate}%`} color="#f39c12" />
        </div>
    );
}

function StatBox({ title, value, color }) {
    return (
        <div style={{ ...styles.box, background: color }}>
            <h4>{title}</h4>
            <strong>{value}</strong>
        </div>
    );
}

const styles = {
    stats: {
        display: "flex",
        gap: "15px",
        flexWrap: "wrap"
    },
    box: {
        flex: 1,
        minWidth: "180px",
        padding: "15px",
        borderRadius: "8px",
        color: "white"
    }
};
