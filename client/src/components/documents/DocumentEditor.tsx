import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Code, 
  Table, 
  AlignLeft, 
  ChevronDown, 
  File, 
  Info,
  MessageSquare,
  ThumbsUp,
  Share,
  Star,
  MoreHorizontal,
  Save,
  Eye,
  Clock,
  UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { User as UserType } from '@shared/schema';

interface DocumentEditorProps {
  title: string;
  content: string;
  author: UserType;
  collaborators: UserType[];
  lastEdited: string | Date;
  onSave?: (title: string, content: string) => void;
  readOnly?: boolean;
}

export function DocumentEditor({
  title: initialTitle,
  content: initialContent,
  author,
  collaborators,
  lastEdited,
  onSave,
  readOnly = false
}: DocumentEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(!readOnly);
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = content;
    }
  }, [content, isEditing]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = () => {
    if (contentEditableRef.current) {
      setContent(contentEditableRef.current.innerHTML);
    }
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave(title, content);
    }
    if (readOnly) {
      setIsEditing(false);
    }
  };
  
  const formatButtonClass = "p-1 hover:bg-gray-200 rounded";
  
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
  };
  
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };
  
  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Document header */}
      <div className="border-b p-4 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <File className="h-4 w-4 mr-1" /> Pages
            </Button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4 mr-1" /> Page info
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" /> Comments
            </Button>
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4 mr-1" /> Star
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
            
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  if (contentEditableRef.current) {
                    contentEditableRef.current.innerHTML = initialContent;
                  }
                  setTitle(initialTitle);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Document content */}
      <div className="flex-grow overflow-auto bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full text-3xl font-bold border-b border-gray-300 pb-2 mb-4 focus:outline-none focus:border-blue-500"
                  placeholder="Document title"
                />
              ) : (
                <h1 className="text-3xl font-bold mb-4">{title}</h1>
              )}
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback>{author.initials}</AvatarFallback>
                  </Avatar>
                  
                  {collaborators.slice(0, 3).map((user, index) => (
                    <Avatar key={index} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                  ))}
                  
                  {collaborators.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                      +{collaborators.length - 3}
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {author.name}
                  </span>
                  <span>·</span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Updated {typeof lastEdited === 'string' ? lastEdited : format(lastEdited, 'MMM d, yyyy')}
                  </span>
                  <span>·</span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    5
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1 flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="text-xs">Published</span>
              </Badge>
            </div>
          </div>
          
          {/* Editor toolbar - only shown when editing */}
          {isEditing && (
            <div className="mb-4 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-2 flex flex-wrap gap-1 border-b">
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('bold')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('italic')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('insertOrderedList')}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('insertUnorderedList')}
                >
                  <List className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={insertLink}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={insertImage}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('formatBlock', '<pre>')}
                >
                  <Code className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatText('insertHTML', '<table><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td><td>Cell 4</td></tr></table>')}
                >
                  <Table className="h-4 w-4" />
                </Button>
                
                <Button 
                  className={formatButtonClass} 
                  variant="ghost" 
                  size="sm"
                >
                  <AlignLeft className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Editable content area */}
          <div
            ref={contentEditableRef}
            contentEditable={isEditing}
            onInput={handleContentChange}
            className={`prose max-w-none ${isEditing ? 'border border-gray-300 p-4 rounded-lg min-h-[300px] focus:outline-none focus:border-blue-500' : ''}`}
            dangerouslySetInnerHTML={{ __html: initialContent }}
          />
          
          {/* Document metadata footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
            <div>
              Created by {author.name} on {format(new Date('2025-04-15'), 'MMMM d, yyyy')}
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-4 w-4 mr-1" /> 3 Likes
              </Button>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" /> 2 Comments
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}