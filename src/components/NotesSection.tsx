import { useState } from 'react';
import { FileText } from 'lucide-react';
import { NotesList } from './NotesList';
import { NoteEditor } from './NoteEditor';
import { NoteViewer } from './NoteViewer';
import { useNotes } from '@/hooks/useNotes';
import { Note, NotesFilter } from '@/types/note';

export const NotesSection = () => {
  const { notes, loading, addNote, updateNote, deleteNote, filterNotes } = useNotes();
  const [filter, setFilter] = useState<NotesFilter>({ search: '' });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const filteredNotes = filterNotes(notes, filter);

  const handleNewNote = () => {
    setEditingNote(null);
    setIsEditing(true);
    setSelectedNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = (title: string, content: string) => {
    if (editingNote) {
      updateNote(editingNote.id, { title, content });
      setSelectedNote({ ...editingNote, title, content, updatedAt: new Date() });
    } else {
      const newNote = addNote({ title, content });
      setSelectedNote(newNote);
    }
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleSelectNote = (note: Note) => {
    if (!isEditing) {
      setSelectedNote(note);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="lg:w-80 lg:flex-shrink-0">
        <NotesList
          notes={filteredNotes}
          filter={filter}
          onFilterChange={setFilter}
          selectedNote={selectedNote}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>

      <div className="flex-1 min-h-0">
        {isEditing ? (
          <NoteEditor
            note={editingNote}
            onSave={handleSaveNote}
            onCancel={handleCancelEdit}
          />
        ) : selectedNote ? (
          <NoteViewer
            note={selectedNote}
            onEdit={() => handleEditNote(selectedNote)}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No note selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select a note from the list or create a new one to get started
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};