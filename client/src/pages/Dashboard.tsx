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

/**
 * Helper to extract the meaningful payload from different response shapes.
 * Accepts:
 *  - AxiosResponse<ApiResponse<T>> (res.data.data)
 *  - AxiosResponse<{ user: T } | { note: T } | { notes: T[] } > (res.data.user / note / notes)
 *  - plain { data: T } or { user: T } objects
 */
function extractPayload<T>(res: any): T | null {
  if (!res) return null;

  // If full Axios response with `data` field
  if (res.data !== undefined) {
    const d = res.data;

    // support nested ApiResponse: { data: T }
    if (d && d.data !== undefined) {
      return d.data as T;
    }

    // support { user: T } or { note: T } or { notes: T[] } shapes
    if (d && (d.user !== undefined || d.note !== undefined || d.notes !== undefined)) {
      return (d.user ?? d.note ?? d.notes) as T;
    }

    // fallback to res.data itself being the payload
    return d as T;
  }

  // support plain objects (not wrapped)
  if (res.user !== undefined) return res.user as T;
  if (res.note !== undefined) return res.note as T;
  if (res.notes !== undefined) return res.notes as T;
  if (res.data !== undefined) return res.data as T;

  return null;
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
      const res = await api.get("/auth/me"); // res is AxiosResponse<...>
      const userData = extractPayload<User>(res);
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
      const res = await api.get("/notes");
      const notesData = extractPayload<Note[] | Note>(res);
      // If backend returned a single note, coerce to array
      if (!notesData) {
        setNotes([]);
      } else if (Array.isArray(notesData)) {
        setNotes(notesData);
      } else {
        setNotes([notesData]);
      }
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
      const res = await api.post("/notes", { title: title.trim(), body: body.trim() });
      const newNote = extractPayload<Note>(res);
      if (newNote) setNotes(prev => [newNote, ...prev]);
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
      const res = await api.put(`/notes/${editingNote._id}`, { title: title.trim(), body: body.trim() });
      const updated = extractPayload<Note>(res);
      if (updated) setNotes(prev => prev.map(n => n._id === editingNote._id ? updated : n));
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
    setBody(note.body ?? "");
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
      await api.delete(`/notes/${noteToDelete._1 ?? noteToDelete._id}`.replace("_1", "_id")); // fallback for weird shapes
      setNotes(prev => prev.filter(n => n._id !== noteToDelete._id));
      closeDeleteModal();
    } catch (err) {
      setError("Failed to delete note");
    }
  }, [noteToDelete, closeDeleteModal]);

  const deleteNote = useCallback((id: string) => {
    const note = notes.find(n => n._id === id);
    if (note) openDeleteModal(note);
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
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Welcome{user ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">{user?.email}</p>
          </div>
          <button onClick={logout} className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl">Logout</button>
        </header>

        {/* Create Note Form */}
        <main className="space-y-6 lg:space-y-8">
          <form onSubmit={createNote} className="bg-white/80 p-6 rounded-2xl shadow-lg border border-white/20">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter a catchy title..." className="w-full p-4 rounded-xl mb-4" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="What's on your mind?" rows={3} className="w-full p-4 rounded-xl mb-4" />
            <button type="submit" disabled={!title.trim()} className="w-full px-6 py-3 bg-green-600 text-white rounded-xl">✨ Create Note</button>
          </form>

          {/* Notes Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">📝 Your Notes ({notes.length})</h2>
              <button onClick={() => setViewMode(v => v === 'horizontal' ? 'vertical' : 'horizontal')} className="px-4 py-2 bg-indigo-500 text-white rounded-xl">
                {viewMode === 'horizontal' ? 'Show All Notes' : 'Horizontal View'}
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12 bg-white/60 rounded-2xl border border-dashed border-gray-300">
                <p className="text-lg text-gray-500">No notes yet!</p>
                <p className="text-sm text-gray-500">Start by creating your first note above.</p>
              </div>
            ) : viewMode === 'horizontal' ? (
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {notes.map(n => (
                  <article key={n._id} className="bg-white p-5 rounded-2xl shadow-lg min-w-[300px] relative">
                    <button onClick={() => deleteNote(n._id)} className="absolute top-3 right-3">✕</button>
                    <h3 className="font-bold text-lg mb-3">{n.title}</h3>
                    <p className="text-gray-600 mb-4">{n.body || "No body text"}</p>
                    <footer className="flex justify-between items-center text-xs text-gray-500">
                      <time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString()}</time>
                      <button onClick={() => handleEdit(n)} className="text-blue-500">✏️ Edit</button>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                {notes.map(n => (
                  <article key={n._id} className="bg-white p-5 rounded-2xl shadow-lg w-full relative">
                    <button onClick={() => deleteNote(n._id)} className="absolute top-3 right-3">✕</button>
                    <h3 className="font-bold text-lg mb-3">{n.title}</h3>
                    <p className="text-gray-600 mb-4">{n.body || "No body text"}</p>
                    <footer className="flex justify-between items-center text-xs text-gray-500">
                      <time dateTime={n.createdAt}>{new Date(n.createdAt).toLocaleString()}</time>
                      <button onClick={() => handleEdit(n)} className="text-blue-500">✏️ Edit</button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-red-500 text-2xl">🗑️</span>
              <h3 className="text-lg font-bold">Delete Note?</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete "{noteToDelete.title}"? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 rounded-xl">Cancel</button>
              <button onClick={confirmDeleteNote} className="px-4 py-2 bg-red-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Edit Note</h3>
            <form onSubmit={updateNote} className="space-y-4">
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 border rounded-xl" />
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} className="w-full p-3 border rounded-xl" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 bg-gray-200 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
