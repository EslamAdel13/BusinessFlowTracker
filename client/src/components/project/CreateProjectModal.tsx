import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { projectColorOptions } from '@/lib/color-utils';
import { useAuthStore } from '@/store/authStore';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Project name is required' }),
  description: z.string().optional(),
  color: z.string().default(projectColorOptions[0].color),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  initialPhase: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateProjectModal = () => {
  const { user } = useAuthStore();
  const { createProject, createPhase } = useProjectStore();
  const { activeModal, closeModal } = useUIStore();
  const { toast } = useToast();
  
  const isOpen = activeModal === 'createProject';
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      color: projectColorOptions[0].color,
      startDate: '',
      endDate: '',
      initialPhase: '',
    },
  });
  
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to create a project',
          variant: 'destructive',
        });
        return;
      }
      
      const newProject = await createProject({
        name: values.name,
        description: values.description || '',
        color: values.color,
        ownerId: user.id,
      });
      
      // If initial phase name is provided, create it
      if (values.initialPhase && values.startDate && values.endDate) {
        await createPhase({
          projectId: newProject.id,
          name: values.initialPhase,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
          deliverable: 'Initial deliverable',
          responsible: user.user_metadata?.full_name || user.email || 'Project Owner',
          status: 'not_started',
          progress: 0,
        });
      }
      
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      
      closeModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new project and add it to your timeline.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
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
                      placeholder="Brief description of the project"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Color</FormLabel>
                  <div className="mt-1 flex space-x-2">
                    {projectColorOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant="ghost"
                        className={`h-8 w-8 rounded-full p-0 ${
                          field.value === option.color ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: option.color }}
                        onClick={() => form.setValue('color', option.color)}
                      >
                        {field.value === option.color && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="initialPhase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Phase (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of the first phase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
