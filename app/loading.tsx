import React from 'react';

const spinnerStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    border: '8px solid #f7c948', // jaune
    borderTop: '8px solid #2176ff', // bleu
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: 'auto',
    display: 'block',
};

const containerStyle: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
};

export default function Loading() {
    return (
        <div style={containerStyle}>
            <div style={spinnerStyle}
            />
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg);}
                        100% { transform: rotate(360deg);}
                    }
                `}
            </style>
        </div>
    );
}