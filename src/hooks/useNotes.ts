import { useState, useEffect } from 'react';
import { Note, NotesFilter } from '@/types/note';

const STORAGE_KEY = 'tarea-notes';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedNotes = JSON.parse(stored).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, loading]);

  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const filterNotes = (notes: Note[], filter: NotesFilter): Note[] => {
    return notes.filter(note => {
      if (filter.search && !note.title.toLowerCase().includes(filter.search.toLowerCase()) && 
          !note.content.toLowerCase().includes(filter.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    filterNotes
  };
};