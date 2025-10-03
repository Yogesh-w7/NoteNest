import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import '../index.css';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Note {
  _id: string;
  title: string;
  body?: string;
  createdAt: string;
  userId: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const nav = useNavigate();

  // Fetch user
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<User>>("/auth/me");
      const userData = res.data.data; // ✅ always use res.data.data
      if (!userData) {
        nav("/login");
        return;
      }
      setUser(userData);
    } catch (err) {
      setError("Failed to fetch user data");
      nav("/login");
    } finally {
      setLoading(false);
    }
  }, [nav]);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<ApiResponse<Note[]>>("/notes");
      const notesData = res.data.data; // ✅ use data.data
      setNotes(notesData || []);
    } catch (err) {
      setError("Failed to fetch notes");
    }
  }, [user]);

  // Create note
  const createNote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setError(null);
      const res = await api.post<ApiResponse<Note>>("/notes", { title: title.trim(), body: body.trim() });
      setNotes(prev => [res.data.data, ...prev]); // ✅ use data.data
      setTitle("");
      setBody("");
    } catch (err) {
      setError("Failed to create note");
    }
  }, [title, body]);

  // Update note
  const updateNote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !title.trim()) return;
    try {
      setError(null);
      const res = await api.put<ApiResponse<Note>>(`/notes/${editingNote._id}`, { title: title.trim(), body: body.trim() });
      setNotes(prev => prev.map(n => n._id === editingNote._id ? res.data.data : n)); // ✅ use data.data
      setTitle("");
      setBody("");
      setEditingNote(null);
      setShowEditModal(false);
    } catch (err) {
      setError("Failed to update note");
    }
  }, [title, body, editingNote]);

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setBody(note.body || "");
    setShowEditModal(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingNote(null);
    setTitle("");
    setBody("");
  }, []);

  const openDeleteModal = useCallback((note: Note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  }, []);

  const confirmDeleteNote = useCallback(async () => {
    if (!noteToDelete) return;
    try {
      setError(null);
      await api.delete(`/notes/${noteToDelete._id}`);
      setNotes(prev => prev.filter(n => n._id !== noteToDelete._id));
      closeDeleteModal();
    } catch (err) {
      setError("Failed to delete note");
    }
  }, [noteToDelete, closeDeleteModal]);

  const deleteNote = useCallback((id: string) => {
    const note = notes.find(n => n._id === id);
    if (note) {
      openDeleteModal(note);
    }
  }, [notes, openDeleteModal]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      nav("/login");
    }
  }, [nav]);

  useEffect(() => { fetchUser(); }, [fetchUser]);
  useEffect(() => { if (user) fetchNotes(); }, [user, fetchNotes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome{user ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label="Logout"
          >Logout</button>
        </header>

        {/* Create Note Form */}
        <main className="space-y-6 lg:space-y-8">
          <form onSubmit={createNote} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-500">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter a catchy title..."
              className="w-full p-4 border-0 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-200/50 text-lg font-medium placeholder-gray-500 transition-all duration-300 shadow-sm hover:shadow-md mb-4"
            />
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full p-4 border-0 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-purple-200/50 text-base placeholder-gray-500 transition-all duration-300 resize-none shadow-sm hover:shadow-md mb-4"
            />
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none"
            >✨ Create Note</button>
          </form>

          {/* Notes Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">📝 Your Notes ({notes.length})</h2>
              <button
                onClick={() => setViewMode(viewMode === 'horizontal' ? 'vertical' : 'horizontal')}
                className="px-4 py-2 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors duration-200"
              >
                {viewMode === 'horizontal' ? 'Show All Notes' : 'Horizontal View'}
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300">
                <p className="text-lg text-gray-500">No notes yet!</p>
                <p className="text-sm text-gray-500">Start by creating your first note above.</p>
              </div>
            ) : viewMode === 'horizontal' ? (
              <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {notes.map(n => (
                  <article key={n._id} className="group bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 min-w-[300px] flex-shrink-0 relative">
                    <button
                      onClick={() => deleteNote(n._id)}
                      className="absolute top-3 right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >✕</button>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">{n.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{n.body || "No body text"}</p>
                    <footer className="flex justify-between items-center text-xs text-gray-500 font-medium pt-2 border-t border-gray-100">
                      <time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                      <button onClick={() => handleEdit(n)} className="text-blue-500 hover:text-blue-600 transition-colors duration-200">✏️ Edit</button>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
                {notes.map(n => (
                  <article key={n._id} className="group bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 relative w-full">
                    <button
                      onClick={() => deleteNote(n._id)}
                      className="absolute top-3 right-3 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >✕</button>
                    <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">{n.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">{n.body || "No body text"}</p>
                    <footer className="flex justify-between items-center text-xs text-gray-500 font-medium pt-2 border-t border-gray-100">
                      <time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                      <button onClick={() => handleEdit(n)} className="text-blue-500 hover:text-blue-600 transition-colors duration-200">✏️ Edit</button>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && noteToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-red-500 text-2xl">🗑️</span>
              <h3 className="text-lg font-bold text-gray-900">Delete Note?</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{noteToDelete.title}"? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors duration-200">Cancel</button>
              <button onClick={confirmDeleteNote} className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors duration-200">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Note</h3>
            <form onSubmit={updateNote} className="space-y-4">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-300 transition duration-200"
              />
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-purple-300 transition duration-200 resize-none"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition duration-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition duration-200">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
