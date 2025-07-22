import { useState, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Note } from '@/types/note';

interface NoteEditorProps {
  note?: Note;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
}

export const NoteEditor = ({ note, onSave, onCancel }: NoteEditorProps) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSave(title.trim(), content.trim());
    }
  };

  const formatText = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText;
    if (selectedText) {
      newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    } else {
      newText = content.substring(0, start) + prefix + suffix + content.substring(end);
    }
    
    setContent(newText);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertListItem = (type: 'bullet' | 'numbered') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);
    
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    let prefix = '\n';
    if (type === 'bullet') {
      prefix += '• ';
    } else {
      // Find the last numbered item to continue the sequence
      const numberedLines = beforeCursor.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
      const lastNumber = numberedLines.length > 0 ? 
        parseInt(numberedLines[numberedLines.length - 1].trim().split('.')[0]) : 0;
      prefix += `${lastNumber + 1}. `;
    }
    
    const newContent = beforeCursor + prefix + afterCursor;
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText('**', '**')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText('*', '*')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => formatText('<u>', '</u>')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-3 w-3" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertListItem('bullet')}
            className="h-8 w-8 p-0"
          >
            <List className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertListItem('numbered')}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="flex-1 min-h-[300px] resize-none border-none shadow-none focus-visible:ring-0 p-0"
        />
      </CardContent>
    </Card>
  );
};