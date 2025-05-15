import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { DocumentType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocPageProps {
  document: DocumentType;
}

export default function DocPage({ document }: DocPageProps) {
  return (
    <Card className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <CardHeader className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">{document.title}</CardTitle>
        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>Edited {document.lastEdited}</span>
        </div>
      </CardHeader>
      
      <ScrollArea className="max-h-96">
        <CardContent className="px-4 py-3">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: document.content }} />
          </div>
        </CardContent>
      </ScrollArea>
      
      <CardFooter className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AvatarGroup>
            {document.collaborators.map((collaborator, index) => (
              <Avatar key={index} className="w-6 h-6 border-2 border-white dark:border-neutral-800">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs">
                  {collaborator.initials}
                </div>
              </Avatar>
            ))}
          </AvatarGroup>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {document.collaborators.length} collaborators
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-xs h-8 px-3">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
