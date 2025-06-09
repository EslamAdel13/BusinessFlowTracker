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
import dayjs from 'dayjs'; // Import dayjs
import { useUIStore } from '@/store/uiStore';
import { projectColorOptions } from '@/lib/color-utils';
import { Phase } from '@shared/schema';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Project name is required' }),
  description: z.string().optional(),
  color: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true; // Validation passes if one or both dates are missing
  },
  {
    message: 'End date cannot be before start date',
    path: ['end_date'], // Path to the field to display the error message
  }
);

type FormValues = z.infer<typeof formSchema>;

interface EditProjectModalProps {
  projectPhases?: Phase[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ projectPhases }) => {
  const { selectedProject, updateProject, deleteProject } = useProjectStore();
  const { activeModal, closeModal } = useUIStore();
  const { toast } = useToast();
  
  const isOpen = activeModal === 'editProject';
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: selectedProject?.name || '',
      description: selectedProject?.description || '',
      color: selectedProject?.color || projectColorOptions[0].color,
      start_date: selectedProject?.start_date ? new Date(selectedProject.start_date).toISOString().split('T')[0] : '',
      end_date: selectedProject?.end_date ? new Date(selectedProject.end_date).toISOString().split('T')[0] : '',
    },
  });
  
  useEffect(() => {
    if (isOpen && selectedProject) {
      form.reset({
        name: selectedProject.name,
        description: selectedProject.description || '',
        color: selectedProject.color,
        start_date: selectedProject.start_date ? new Date(selectedProject.start_date).toISOString().split('T')[0] : '',
        end_date: selectedProject.end_date ? new Date(selectedProject.end_date).toISOString().split('T')[0] : '',
      });
    }
  }, [isOpen, selectedProject, form]);
  
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

      // Validate if phases are within the new project date range
      const newProjectStartDateString = values.start_date;
      const newProjectEndDateString = values.end_date;
      
      console.log('Project Dates for Validation:', { newProjectStartDateString, newProjectEndDateString });
      console.log('Phases for Validation:', projectPhases);

      if (projectPhases && projectPhases.length > 0 && (newProjectStartDateString || newProjectEndDateString)) {
        const outOfBoundsPhases: string[] = [];
        // Ensure dates from form (YYYY-MM-DD) are parsed correctly by dayjs for comparison
        const newProjectStartDayjs = newProjectStartDateString ? dayjs(newProjectStartDateString) : null;
        const newProjectEndDayjs = newProjectEndDateString ? dayjs(newProjectEndDateString) : null;

        console.log('Parsed Project Dates (dayjs):', { newProjectStartDayjs, newProjectEndDayjs });

        for (const phase of projectPhases) {
          const phaseStartDayjs = dayjs(phase.start_date);
          const phaseEndDayjs = dayjs(phase.end_date);
          let isOutOfBounds = false;

          console.log(`Checking Phase: ${phase.name}`, { 
            phaseStart: phaseStartDayjs.format('YYYY-MM-DD'), 
            phaseEnd: phaseEndDayjs.format('YYYY-MM-DD') 
          });

          // Check if phase starts before project start (if project start is defined)
          if (newProjectStartDayjs && phaseStartDayjs.isBefore(newProjectStartDayjs, 'day')) {
            console.log(`Phase ${phase.name} starts before project start.`);
            isOutOfBounds = true;
          }
          // Check if phase ends after project end (if project end is defined)
          if (newProjectEndDayjs && phaseEndDayjs.isAfter(newProjectEndDayjs, 'day')) {
            console.log(`Phase ${phase.name} ends after project end.`);
            isOutOfBounds = true;
          }

          if (isOutOfBounds) {
            outOfBoundsPhases.push(phase.name);
          }
        }

        if (outOfBoundsPhases.length > 0) {
          toast({
            title: 'Invalid Project Dates',
            description: `The following phases would be outside the new project date range: ${outOfBoundsPhases.join(', ')}. Please adjust project dates or phase dates.`,
            variant: 'destructive',
            duration: 7000, 
          });
          return; // Prevent update
        }
      }
      
      await updateProject(selectedProject.id, {
        name: values.name,
        description: values.description || '',
        color: values.color,
        start_date: values.start_date ? new Date(values.start_date).toISOString() : null,
        end_date: values.end_date ? new Date(values.end_date).toISOString() : null,
      });
      
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      
      closeModal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      if (!selectedProject) {
        toast({
          title: 'Error',
          description: 'No project selected',
          variant: 'destructive',
        });
        return;
      }
      
      if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        await deleteProject(selectedProject.id);
        
        toast({
          title: 'Success',
          description: 'Project deleted successfully',
        });
        
        closeModal();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  if (!selectedProject) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
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
                name="end_date"
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
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete Project
              </Button>
              <div className="flex-1"></div>
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectModal;
