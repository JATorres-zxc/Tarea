import { Edit, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Note } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';

interface NoteViewerProps {
  note: Note;
  onEdit: () => void;
}

export const NoteViewer = ({ note, onEdit }: NoteViewerProps) => {
  const renderFormattedContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic text
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Underlined text
        line = line.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
        
        // Bullet points
        if (line.trim().startsWith('•')) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-primary">•</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^•\s*/, '') }} />
            </div>
          );
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
        if (numberedMatch) {
          return (
            <div key={index} className="flex items-start gap-2 mb-1">
              <span className="text-primary font-medium">{numberedMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
            </div>
          );
        }
        
        // Regular lines
        if (line.trim()) {
          return (
            <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: line }} />
          );
        }
        
        // Empty lines
        return <br key={index} />;
      });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold mb-2">{note.title}</h1>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Created {formatDistanceToNow(note.createdAt, { addSuffix: true })}</span>
              </div>
              {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                <span>Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
              )}
            </div>
          </div>
          <Button onClick={onEdit} variant="outline" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {renderFormattedContent(note.content)}
        </div>
      </CardContent>
    </Card>
  );
};