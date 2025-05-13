import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface CreateTaskFormProps {
  phaseId: number;
  projectId: number;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: 'Task name is required' }),
  assignee: z.string().optional(),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const CreateTaskForm = ({ phaseId, projectId, onSuccess }: CreateTaskFormProps) => {
  const { createTask } = useTaskStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const userName = user?.user_metadata?.full_name || user?.email || 'Me';
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      assignee: userName,
      dueDate: new Date().toISOString().split('T')[0],
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    try {
      await createTask({
        phaseId,
        projectId,
        name: values.name,
        assignee: values.assignee || userName,
        dueDate: new Date(values.dueDate).toISOString(),
        status: 'todo',
        priority: 0,
      });
      
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
      
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 p-3 border border-gray-200 rounded-md bg-gray-50">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Task Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter task name" {...field} className="h-8 text-sm" />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Assignee</FormLabel>
                <FormControl>
                  <Input placeholder="Who will do this task?" {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="h-8 text-xs">Add Task</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateTaskForm;
