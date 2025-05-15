import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// Project form schema
const projectFormSchema = z.object({
  name: z.string().min(3, { message: 'Project name must be at least 3 characters' }),
  key: z.string().min(2, { message: 'Project key must be at least 2 characters' }),
  type: z.string(),
  description: z.string().optional(),
  icon: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      key: '',
      type: 'Company-managed software',
      description: '',
      icon: '',
    },
  });
  
  const onSubmit = async (data: ProjectFormValues) => {
    try {
      // Generate an icon from first letter if not provided
      if (!data.icon) {
        data.icon = `#${data.name.charAt(0).toUpperCase()}`;
      }
      
      // In a real implementation, this would make an API call
      // For now, we'll just simulate success and close the dialog
      console.log('Creating project:', data);
      
      toast({
        title: 'Project created',
        description: `Successfully created project ${data.name}`,
      });
      
      // Invalidate projects query to refetch with new project
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error creating project',
        description: 'There was an error creating your project. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Auto-generate project key as user types the name
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    // Create key from first letters of words in uppercase
    const key = name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    
    form.setValue('key', key);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Project</DialogTitle>
          <DialogDescription>
            Required fields are marked with an asterisk *
          </DialogDescription>
          <Button 
            className="absolute right-4 top-4" 
            variant="ghost" 
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project name" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project key *</FormLabel>
                  <FormControl>
                    <Input placeholder="Project key" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short, unique identifier for this project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Company-managed software">Company-managed software</SelectItem>
                      <SelectItem value="Team-managed software">Team-managed software</SelectItem>
                      <SelectItem value="Business project">Business project</SelectItem>
                      <SelectItem value="Service desk">Service desk</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the purpose of this project" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}