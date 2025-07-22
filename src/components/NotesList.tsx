import { useState } from 'react';
import { Search, Plus, FileText, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Note, NotesFilter } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';

interface NotesListProps {
  notes: Note[];
  filter: NotesFilter;
  onFilterChange: (filter: NotesFilter) => void;
  selectedNote?: Note;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesList = ({
  notes,
  filter,
  onFilterChange,
  selectedNote,
  onSelectNote,
  onNewNote,
  onEditNote,
  onDeleteNote
}: NotesListProps) => {
  const [searchFocused, setSearchFocused] = useState(false);

  const truncateText = (text: string, maxLength: number = 80) => {
    // Remove markdown formatting for preview
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/<u>(.*?)<\/u>/g, '$1')
      .replace(/^[•\d+\.]\s/gm, '')
      .replace(/\n/g, ' ')
      .trim();
    
    return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
  };

  return (
    <div className="h-full flex flex-col bg-muted/30 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-background/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Notes</h2>
          <Button onClick={onNewNote} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
            searchFocused ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <Input
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search notes..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-muted-foreground mb-2">No notes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first note to get started
            </p>
            <Button onClick={onNewNote} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Note
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {notes.map((note) => (
              <Card
                key={note.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  selectedNote?.id === note.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelectNote(note)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {note.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {truncateText(note.content)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditNote(note);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};