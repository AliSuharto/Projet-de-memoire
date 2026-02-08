// src/pages/NotesPage.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Search, Calendar, Clock, X, Edit2, Trash2 } from 'lucide-react';
import API_BASE_URL from '@/services/APIbaseUrl';

interface Note {
  id: number;
  titre: string;
  contenu: string;
  creationDate: string;
  modifDate: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'creation' | 'modif'>('creation');
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Récupérer le token depuis localStorage
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || '';
    }
    return '';
  };

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notes', {
        params: { search: search.trim() || undefined },
      });
      setNotes(res.data.data ?? []);
    } catch (err) {
      console.error('Erreur récupération notes', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le clic de déclencher l'édition

    if (!confirm('Voulez-vous vraiment supprimer cette note ?')) return;

    try {
      await axiosInstance.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      console.error('Erreur suppression', err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    try {
      if (editingNote) {
        const res = await axiosInstance.put(`/notes/${editingNote.id}`, {
          titre: title,
          contenu: content,
        });
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNote.id ? res.data.data : n))
        );
      } else {
        const res = await axiosInstance.post('/notes', {
          titre: title,
          contenu: content,
        });
        setNotes((prev) => [res.data.data, ...prev]);
      }
      closeForm();
    } catch (err: any) {
      console.error('Erreur sauvegarde', err);
      alert(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.titre);
    setContent(note.contenu);
    setIsFormOpen(true);
  };

  const formatDate = (isoString: string, withTime = false) => {
    const date = new Date(isoString);
    if (withTime) {
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(sortBy === 'creation' ? a.creationDate : a.modifDate);
    const dateB = new Date(sortBy === 'creation' ? b.creationDate : b.modifDate);
    return dateB.getTime() - dateA.getTime();
  });

  const filteredNotes = sortedNotes.filter((n) =>
    n.titre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-0 pt-20 md:pt-0 mt-0">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md rounded-b-lg border-b border-gray-200 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
            Mes Notes
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher une note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm transition-all"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'creation' | 'modif')}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            >
              <option value="creation">Date de création</option>
              <option value="modif">Dernière modification</option>
            </select>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              Nouvelle note
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 py-10 md:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Chargement des notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center text-gray-500">
            <p className="text-lg mb-6">
              {search
                ? 'Aucune note ne correspond à votre recherche'
                : 'Vous n’avez pas encore de notes'}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Créer ma première note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => startEdit(note)}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-200 cursor-pointer relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1 pr-2 text-gray-800">
                    {note.titre || 'Sans titre'}
                  </h3>

                  {/* Boutons actions (visibles au hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(note);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Modifier"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-4 mb-6 leading-relaxed">
                  {note.contenu || 'Aucun contenu...'}
                </p>

                <div className="flex flex-wrap gap-5 text-xs text-gray-500 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {formatDate(note.creationDate)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatDate(note.modifDate, true)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal (inchangé) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingNote ? 'Modifier la note' : 'Nouvelle note'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <input
                placeholder="Titre de la note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="w-full text-2xl font-semibold bg-transparent border-b border-gray-300 pb-3 mb-6 outline-none focus:border-indigo-500 transition-colors text-gray-800"
              />

              <textarea
                placeholder="Commencez à écrire ici..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 resize-none bg-transparent outline-none text-base leading-relaxed text-gray-700"
              />
            </div>

            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={closeForm}
                className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !content.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingNote ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;