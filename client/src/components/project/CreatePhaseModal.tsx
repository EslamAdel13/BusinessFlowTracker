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
import { useAuthStore } from '@/store/authStore';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Phase name is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  deliverable: z.string().optional(),
  responsible: z.string().optional(),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type FormValues = z.infer<typeof formSchema>;

const CreatePhaseModal = () => {
  const { user } = useAuthStore();
  const { selectedProject, createPhase } = useProjectStore();
  const { activeModal, closeModal } = useUIStore();
  const { toast } = useToast();
  
  const isOpen = activeModal === 'createPhase';
  
  const userName = user?.user_metadata?.full_name || user?.email || 'Project Owner';
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      deliverable: '',
      responsible: userName,
    },
  });
  
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    } else {
      form.setValue('responsible', userName);
    }
  }, [isOpen, form, userName]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      if (!selectedProject) {
        toast({
          title: 'Error',
          description: 'No project selected',
          variant: 'destructive',
        });
        return;
      }
      
      await createPhase({
        projectId: selectedProject.id,
        name: values.name,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        deliverable: values.deliverable || `Deliverable for ${values.name}`,
        responsible: values.responsible || userName,
        status: 'not_started',
        progress: 0,
      });
      
      toast({
        title: 'Success',
        description: 'Phase created successfully',
      });
      
      closeModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create phase',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Phase</DialogTitle>
          <DialogDescription>
            Add a new phase to project {selectedProject?.name || 'selected project'}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phase Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phase name" {...field} />
                  </FormControl>
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
              name="deliverable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deliverable</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What will be delivered at the end of this phase?"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsible Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Who is responsible for this phase?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Create Phase</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePhaseModal;
