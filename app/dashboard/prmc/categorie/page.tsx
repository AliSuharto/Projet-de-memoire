'use client';
import React, { useEffect, useState } from "react";

// Dummy API functions (replace with your real API calls)
const fetchCategories = async () => {
    // Replace with your API call
    return [
        { id: 1, nom: "Catégorie A", description: "Desc A", tarif: 100 },
        { id: 2, nom: "Catégorie B", description: "Desc B", tarif: 200 },
    ];
};

const createCategory = async (category: { nom: string; description: string; tarif: number }) => {
    // Replace with your API call
    return { id: Math.random(), ...category };
};

const updateCategory = async (id: number, category: { nom: string; description: string; tarif: number }) => {
    // Replace with your API call
    return { id, ...category };
};

type Category = {
    id: number;
    nom: string;
    description: string;
    tarif: number;
};

export default function CategoriePage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [view, setView] = useState<"list" | "grid">("list");
    const [selected, setSelected] = useState<Category | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCategories().then(setCategories);
    }, []);

    const handleCreate = async (data: Omit<Category, "id">) => {
        const newCat = await createCategory(data);
        setCategories([...categories, newCat]);
        setShowForm(false);
    };

    const handleUpdate = async (id: number, data: Omit<Category, "id">) => {
        const updated = await updateCategory(id, data);
        setCategories(categories.map(cat => (cat.id === id ? updated : cat)));
        setSelected(null);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Catégories</h1>
                <div>
                    <button className="mr-2" onClick={() => setView("list")}>Liste</button>
                    <button className="mr-2" onClick={() => setView("grid")}>Mosaique</button>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>
                        Nouvelle catégorie
                    </button>
                </div>
            </div>

            {view === "list" ? (
                <ul className="divide-y">
                    {categories.map(cat => (
                        <li key={cat.id} className="py-2 cursor-pointer hover:bg-gray-100" onClick={() => setSelected(cat)}>
                            <strong>{cat.nom}</strong> — {cat.description} — <span className="text-green-600">{cat.tarif} €</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="border p-4 rounded cursor-pointer hover:shadow" onClick={() => setSelected(cat)}>
                            <h2 className="font-bold">{cat.nom}</h2>
                            <p>{cat.description}</p>
                            <p className="text-green-600">{cat.tarif} €</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulaire création */}
            {showForm && (
                <CategoryForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Formulaire mise à jour */}
            {selected && (
                <CategoryForm
                    initial={selected}
                    onSubmit={data => handleUpdate(selected.id, data)}
                    onCancel={() => setSelected(null)}
                />
            )}
        </div>
    );
}

function CategoryForm({
    initial,
    onSubmit,
    onCancel,
}: {
    initial?: { nom: string; description: string; tarif: number };
    onSubmit: (data: { nom: string; description: string; tarif: number }) => void;
    onCancel: () => void;
}) {
    const [nom, setNom] = useState(initial?.nom || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [tarif, setTarif] = useState(initial?.tarif || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ nom, description, tarif });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <form className="bg-white p-6 rounded shadow w-80" onSubmit={handleSubmit}>
                <h2 className="text-lg font-bold mb-4">{initial ? "Modifier" : "Créer"} une catégorie</h2>
                <div className="mb-2">
                    <label className="block mb-1">Nom</label>
                    <input className="border w-full px-2 py-1" value={nom} onChange={e => setNom(e.target.value)} required />
                </div>
                <div className="mb-2">
                    <label className="block mb-1">Description</label>
                    <input className="border w-full px-2 py-1" value={description} onChange={e => setDescription(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Tarif (€)</label>
                    <input
                        type="number"
                        className="border w-full px-2 py-1"
                        value={tarif}
                        onChange={e => setTarif(Number(e.target.value))}
                        required
                        min={0}
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" className="px-3 py-1" onClick={onCancel}>Annuler</button>
                    <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
                        {initial ? "Mettre à jour" : "Créer"}
                    </button>
                </div>
            </form>
        </div>
    );
}