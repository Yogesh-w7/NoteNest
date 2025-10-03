// src/pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

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

/** Safe payload extractor (handles res.data.data, res.data.user/note/notes, or raw payload) */
function extractPayload<T>(response: any): T | null {
  if (!response) return null;
  // AxiosResponse: actual payload often sits under response.data
  const d = response.data ?? response;

  if (!d) return null;

  // Preferred nested shape: { data: <payload> }
  if (d.data !== undefined) return d.data as T;

  // Legacy shapes: { user: <payload> } | { note: <payload> } | { notes: <payload[]> }
  if ((d as any).user !== undefined) return (d as any).user as T;
  if ((d as any).note !== undefined) return (d as any).note as T;
  if ((d as any).notes !== undefined) return (d as any).notes as unknown as T;

  // Otherwise, assume d itself is the payload
  return d as T;
}

export default function Dashboard() {
  const nav = useNavigate();
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
  const [viewMode, setViewMode] = useState<"horizontal" | "vertical">("horizontal");

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
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

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notes");
      const payload = extractPayload<Note[] | Note>(res);
      if (!payload) setNotes([]);
      else if (Array.isArray(payload)) setNotes(payload);
      else setNotes([payload]);
    } catch (err) {
      setError("Failed to fetch notes");
    }
  }, [user]);

  const createNote = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      try {
        setError(null);
        const res = await api.post("/notes", { title: title.trim(), body: body.trim() });
        const newNote = extractPayload<Note>(res);
        if (newNote) setNotes((p) => [newNote, ...p]);
        setTitle("");
        setBody("");
      } catch {
        setError("Failed to create note");
      }
    },
    [title, body]
  );

  const updateNote = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingNote || !title.trim()) return;
      try {
        setError(null);
        const res = await api.put(`/notes/${editingNote._id}`, { title: title.trim(), body: body.trim() });
        const updated = extractPayload<Note>(res);
        if (updated) setNotes((p) => p.map((n) => (n._id === editingNote._id ? updated : n)));
        setTitle("");
        setBody("");
        setEditingNote(null);
        setShowEditModal(false);
      } catch {
        setError("Failed to update note");
      }
    },
    [title, body, editingNote]
  );

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
      await api.delete(`/notes/${noteToDelete._id}`);
      setNotes((p) => p.filter((n) => n._id !== noteToDelete._id));
      closeDeleteModal();
    } catch {
      setError("Failed to delete note");
    }
  }, [noteToDelete, closeDeleteModal]);

  const deleteNote = useCallback(
    (id: string) => {
      const n = notes.find((x) => x._id === id);
      if (n) openDeleteModal(n);
    },
    [notes, openDeleteModal]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      nav("/login");
    }
  }, [nav]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user, fetchNotes]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <>
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">{user ? `Welcome, ${user.name}` : "Welcome"}</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">Logout</button>
        </header>

        <main className="space-y-6">
          <form onSubmit={createNote} className="bg-white p-6 rounded shadow">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full p-3 mb-3 border rounded" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Body" className="w-full p-3 mb-3 border rounded" />
            <button type="submit" disabled={!title.trim()} className="px-4 py-2 bg-green-600 text-white rounded">
              Create
            </button>
          </form>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Notes ({notes.length})</h2>
              <button onClick={() => setViewMode((v) => (v === "horizontal" ? "vertical" : "horizontal"))} className="px-3 py-1 bg-indigo-500 text-white rounded">
                {viewMode === "horizontal" ? "Show All Notes" : "Horizontal View"}
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="p-6 bg-white rounded border-dashed border">No notes yet</div>
            ) : viewMode === "horizontal" ? (
              <div className="flex overflow-x-auto space-x-4 pb-4">
                {notes.map((n) => (
                  <article key={n._id} className="bg-white p-5 rounded shadow min-w-[280px] relative">
                    <button onClick={() => deleteNote(n._1 ?? n._id)} className="absolute top-2 right-2">✕</button>
                    <h3 className="font-bold">{n.title}</h3>
                    <p className="text-gray-600">{n.body}</p>
                    <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                    <button onClick={() => handleEdit(n)} className="text-blue-500 mt-2">Edit</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((n) => (
                  <article key={n._id} className="bg-white p-5 rounded shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{n.title}</h3>
                        <p className="text-gray-600">{n.body}</p>
                        <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleEdit(n)} className="text-blue-500">Edit</button>
                        <button onClick={() => deleteNote(n._id)} className="text-red-500">Delete</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Delete modal */}
      {showDeleteModal && noteToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-bold mb-2">Delete Note?</h3>
            <p className="text-sm mb-4">Delete "{noteToDelete.title}"?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={closeDeleteModal} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDeleteNote} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="font-bold mb-2">Edit Note</h3>
            <form onSubmit={updateNote} className="space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded" />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full p-3 border rounded" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEditModal} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
