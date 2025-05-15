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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusIcon, X, ExternalLink, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Task form schema
const taskFormSchema = z.object({
  project: z.string(),
  workType: z.string(),
  title: z.string().min(5, { message: 'Summary must be at least 5 characters' }),
  status: z.string(),
  description: z.string().optional(),
  priority: z.string(),
  assignee: z.string().optional(),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  estimate: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

// Sample data for dropdowns
const workTypes = [
  { value: 'story', label: 'Story', icon: 'S' },
  { value: 'task', label: 'Task', icon: 'T' },
  { value: 'bug', label: 'Bug', icon: 'B' },
  { value: 'epic', label: 'Epic', icon: 'E' },
  { value: 'initiative', label: 'Initiative', icon: 'I' },
  { value: 'feedback', label: 'Feedback', icon: 'F' },
  { value: 'new-feature', label: 'New Feature', icon: 'N' },
  { value: 'support', label: 'Support', icon: 'S' },
  { value: 'dev-escalation', label: 'Developer escalation', icon: 'D' },
];

const priorities = [
  { value: 'highest', label: 'Highest' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'lowest', label: 'Lowest' },
];

// Sample projects for dropdown
const projects = [
  { value: 'ASYNCCOMM', label: 'Async Community' },
  { value: 'KCONNECTAI', label: 'Kerio Connect AI' },
  { value: 'KHOROSIMP', label: 'Eng/PS Khoros Import' },
  { value: 'NOBILLABLE', label: 'Non Billable Time Tracking' },
  { value: 'JIVEBSE', label: 'Jive BU Support & Engineering' },
];

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedProject?: string;
}

export function CreateTaskDialog({ open, onOpenChange, preSelectedProject }: CreateTaskDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      project: preSelectedProject || '',
      workType: 'story',
      title: '',
      status: 'todo',
      description: '',
      priority: 'medium',
      assignee: '',
      labels: [],
    },
  });
  
  const onSubmit = async (data: TaskFormValues) => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll just simulate success and close the dialog
      console.log('Creating task:', data);
      
      toast({
        title: 'Task created',
        description: `Successfully created task: ${data.title}`,
      });
      
      // Invalidate tasks query to refetch with new task
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error creating task',
        description: 'There was an error creating your task. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create</DialogTitle>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.value} value={project.value}>
                          {project.label} ({project.value})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <span className="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-800 rounded mr-2">
                              {type.icon}
                            </span>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    <a href="#" className="text-blue-600 hover:underline flex items-center text-xs">
                      Learn about work types <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="inprogress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This is the initial status upon creation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a brief summary" {...field} />
                  </FormControl>
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
                      placeholder="Paste a Confluence link here, and we can help generate the description from the page's contents."
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      <a href="#" className="text-blue-600 hover:underline flex items-center text-xs">
                        Learn about priority levels <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Automatic" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="me">Assign to me</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-blue-600"
                      onClick={() => form.setValue('assignee', 'me')}
                    >
                      Assign to me
                    </Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Allows the planned start date for a piece of work to be set.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="estimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Original Estimate</FormLabel>
                  <FormControl>
                    <Input placeholder="2w 1d 5h 4m" {...field} />
                  </FormControl>
                  <FormDescription>
                    An estimate of how much work remains until this issue will be resolved.
                    The format of this is "*w *d *h *m" (representing weeks, days, hours and minutes - where * can be any number).
                    Examples: 4d, 5h 30m, 60m and 3w.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="labels"
              render={() => (
                <FormItem>
                  <FormLabel>Labels</FormLabel>
                  <FormControl>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select label" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Create another</FormLabel>
              </div>
            </FormItem>
            
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