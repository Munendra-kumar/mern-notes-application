
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/notes";

const noteColors = ["yellow", "blue", "pink", "green"];

// MongoDB note ko UI ke format mein convert karna
const formatNote = (note, index = 0) => ({
  ...note,
  id: note._id,
  color: noteColors[index % noteColors.length],
  updatedAt: note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString()
    : "Recently",
});

function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Backend se saare notes load karna
  const fetchNotes = async () => {
    try {
      setApiError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Notes load nahi ho paaye.");
      }

      const data = await response.json();

      setNotes(data.map((note, index) => formatNote(note, index)));
    } catch (err) {
      setApiError(
        "Backend se connect nahi ho pa raha. Backend server check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Search functionality
  const filteredNotes = notes.filter((note) => {
    const searchText = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(searchText) ||
      (note.content || "").toLowerCase().includes(searchText)
    );
  });

  // Add form kholna
  const openAddForm = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  // Edit form kholna
  const openEditForm = (note) => {
    setTitle(note.title);
    setContent(note.content || "");
    setEditingId(note.id);
    setError("");
    setShowForm(true);
  };

  // 2. Naya note create karna ya existing note update karna
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setApiError("");

      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Note save nahi ho paaya.");
      }

      // Backend se save hua note milne ke baad list refresh karna
      await fetchNotes();

      setTitle("");
      setContent("");
      setEditingId(null);
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.message || "Note save karte waqt error aaya.");
    } finally {
      setSaving(false);
    }
  };

  // 3. Note delete karna
  const deleteNote = async (id) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!shouldDelete) return;

    try {
      setApiError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Note delete nahi ho paaya.");
      }

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== id)
      );
    } catch (err) {
      setApiError(err.message || "Note delete karte waqt error aaya.");
    }
  };

  // Form band karna
  const closeForm = () => {
    setShowForm(false);
    setTitle("");
    setContent("");
    setEditingId(null);
    setError("");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>NoteSpace</span>
        </div>

        <p className="menu-heading">WORKSPACE</p>

        <button className="menu-item active" type="button">
          <span className="menu-icon">▤</span>
          All Notes
          <span className="note-count">{notes.length}</span>
        </button>

        <button className="menu-item" type="button" onClick={openAddForm}>
          <span className="menu-icon">＋</span>
          Create Note
        </button>

        <div className="sidebar-bottom">
          <div className="profile-avatar">U</div>
          <div>
            <p className="profile-name">My Workspace</p>
            <p className="profile-label">Personal notes</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace / All Notes</div>
          <div className="topbar-label">
            <span className="status-dot"></span>
            My personal space
          </div>
        </header>

        <section className="dashboard">
          <div className="welcome-section">
            <div>
              <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
              <h1>All your thoughts, in one place.</h1>
              <p className="subtitle">
                Capture ideas, organize your work and never lose a thought.
              </p>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={openAddForm}
            >
              <span>＋</span> New Note
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search your notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search notes"
              />

              {search && (
                <button
                  className="clear-search"
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <div className="total-notes">
              <span className="total-number">{notes.length}</span>
              <span>Total notes</span>
            </div>
          </div>

          <div className="section-heading">
            <div>
              <h2>Your Notes</h2>
              <p>
                {search
                  ? `Search results for "${search}"`
                  : "Your ideas and thoughts at a glance"}
              </p>
            </div>

            <span className="results-count">
              {filteredNotes.length}{" "}
              {filteredNotes.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {apiError && <p className="form-error">{apiError}</p>}

          {loading ? (
            <p>Loading notes...</p>
          ) : filteredNotes.length > 0 ? (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <article
                  className={`note-card note-${note.color}`}
                  key={note.id}
                >
                  <div className="note-card-top">
                    <span className="note-category">PERSONAL NOTE</span>
                    <span className="note-symbol">✳</span>
                  </div>

                  <h3>{note.title}</h3>
                  <p className="note-content">{note.content}</p>

                  <div className="note-footer">
                    <span className="note-date">
                      <span>◷</span> {note.updatedAt}
                    </span>

                    <div className="note-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEditForm(note)}
                        aria-label={`Edit ${note.title}`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteNote(note.id)}
                        aria-label={`Delete ${note.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No notes found</h3>
              <p>
                {search
                  ? "Try a different search term."
                  : "Create your first note to get started."}
              </p>

              {!search && (
                <button
                  className="primary-button"
                  type="button"
                  onClick={openAddForm}
                >
                  ＋ Create your first note
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <section
            className="note-form-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-heading"
          >
            <div className="form-heading">
              <div>
                <p className="eyebrow">
                  {editingId !== null ? "EDIT NOTE" : "NEW NOTE"}
                </p>

                <h2 id="form-heading">
                  {editingId !== null ? "Update your note" : "Create a note"}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="note-title">Note title</label>
              <input
                id="note-title"
                type="text"
                placeholder="Give your note a title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />

              <label htmlFor="note-content">Note content</label>
              <textarea
                id="note-content"
                placeholder="Write down your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={5000}
                required
              />

              {error && <p className="form-error">{error}</p>}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Save Changes"
                    : "Create Note"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
