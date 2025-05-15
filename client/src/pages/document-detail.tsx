import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { DocumentEditor } from "@/components/documents/DocumentEditor";
import { DocumentType, User as UserType } from "@shared/schema";

// Document space type
interface DocumentSpace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

// Enhanced document type with additional properties
interface EnhancedDocument extends DocumentType {
  space: DocumentSpace;
  author: UserType;
  lastVisited?: string;
}

export default function DocumentDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [document, setDocument] = useState<EnhancedDocument | null>(null);
  
  // Sample users data
  const users: UserType[] = [
    { id: "1", username: "thibault.bridel", name: "Thibault Bridel-Bertomeu", initials: "TB", avatar: null },
    { id: "2", username: "omar.sota", name: "Omar Sota", initials: "OS", avatar: null },
    { id: "3", username: "jacob.brown", name: "Jacob Brown", initials: "JB", avatar: null },
  ];

  // Sample spaces data
  const spaces: DocumentSpace[] = [
    { id: "1", name: "Async Community", color: "#584CD1" },
    { id: "2", name: "Khoros Prep", color: "#6554C0" },
    { id: "3", name: "Jive", color: "#0052CC" },
    { id: "4", name: "The Async Way", color: "#00B8D9" }
  ];
  
  // Sample documents data
  const documents: EnhancedDocument[] = [
    {
      id: "1",
      title: "Jive Rewrite Project: Battle Plan",
      content: "<p>Executive Summary: This document outlines a comprehensive implementation plan for rebuilding Jive's core functionalities on the Async Community platform.</p><p>Key goals:</p><ul><li>Replace legacy systems with modern architecture</li><li>Improve performance by 50%</li><li>Enhance user experience</li></ul>",
      lastEdited: "2025-05-11",
      collaborators: [users[0], users[1]],
      space: spaces[0],
      author: users[1],
      lastVisited: "2025-05-11",
    },
    {
      id: "2", 
      title: "Khoros Repository Investigation",
      content: "<p>Analysis of the current state of the Khoros codebase and recommendations for integration.</p><p>Findings:</p><ol><li>Legacy code requires significant refactoring</li><li>Documentation is outdated</li><li>Test coverage is below 40%</li></ol>",
      lastEdited: "2025-05-10",
      collaborators: [users[0], users[2]],
      space: spaces[1],
      author: users[0],
      lastVisited: "2025-05-10",
    },
  ];
  
  // Fetch document data - in a real app, this would be an API call
  useEffect(() => {
    if (id) {
      const foundDoc = documents.find(doc => doc.id === id);
      if (foundDoc) {
        setDocument(foundDoc);
      } else {
        toast({
          title: "Document not found",
          description: `No document found with ID ${id}`,
          variant: "destructive",
        });
      }
    }
  }, [id, toast]);
  
  // Handle saving document
  const handleSaveDocument = (title: string, content: string) => {
    if (document) {
      const updatedDoc = {
        ...document,
        title,
        content,
        lastEdited: new Date().toISOString(),
      };
      setDocument(updatedDoc);
      
      toast({
        title: "Document saved",
        description: "Your changes have been saved successfully",
      });
    }
  };
  
  if (!document) {
    return <div className="flex items-center justify-center h-screen">Loading document...</div>;
  }
  
  return (
    <div className="h-screen flex flex-col">
      <DocumentEditor
        title={document.title}
        content={document.content}
        author={document.author}
        collaborators={document.collaborators}
        lastEdited={document.lastEdited}
        onSave={handleSaveDocument}
        readOnly={false}
      />
    </div>
  );
}