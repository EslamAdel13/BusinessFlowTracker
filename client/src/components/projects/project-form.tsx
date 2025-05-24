import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertProjectSchema, Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth.tsx";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import { addDays, format } from "date-fns";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const projectFormSchema = insertProjectSchema.extend({
  initialPhase: z.string().optional(),
  owner_id: z.string().optional()
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const colorOptions = [
  { value: "#3B82F6", name: "Blue" },
  { value: "#8B5CF6", name: "Purple" },
  { value: "#10B981", name: "Green" },
  { value: "#EF4444", name: "Red" },
  { value: "#F59E0B", name: "Yellow" },
  { value: "#6366F1", name: "Indigo" },
];

interface ProjectFormProps {
  project?: Project;
}

export function ProjectForm({ project }: ProjectFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { closeCreateProjectModal, isCreateProjectModalOpen } = useAppStore();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      color: project?.color || "#6366F1", // Default to indigo
      owner_id: user?.id ?? '',
      initialPhase: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      console.log('Project creation started', { user, values });

      // Ensure user is authenticated
      if (!user) {
        console.error('No user found during project creation');
        throw new Error('You must be logged in to create a project');
      }

      // Extract initialPhase data before sending to Supabase
      const { initialPhase, ...projectData } = values;

      console.log('Prepared project data:', { projectData, user });
      console.log('User ID:', user.id);
      
      console.log('Attempting Supabase insertion with data:', projectData);
      
      // Log the exact keys being sent
      console.log('Project data keys:', Object.keys(projectData));
      
      // Validate data before insertion
      console.log('User object:', user);
      console.log('Full project data:', projectData);
      
      const validatedData = {
        name: projectData.name,
        description: projectData.description || null,
        owner_id: user.id,  // Always use the current user's ID
        color: projectData.color || '#6366f1'
      };
      
      console.log('Validated data for Supabase:', validatedData);
      console.log('User ID being used:', user.id);
      
      // Verify user ID type and value
      if (!user.id) {
        console.error('No user ID found!');
        throw new Error('Authentication required to create a project');
      }
      
      console.log('Validated data for insertion:', validatedData);
      
      console.log('Attempting Supabase insertion with:', validatedData);
      
      const { data, error } = await supabase
        .from('projects')
        .insert(validatedData)
        .select()
        .single();
      
      console.log('Supabase insertion result:', { data, error });
      
      if (error) {
        console.error('Detailed Supabase error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      }
      
      console.log('Supabase insertion result:', { data, error });
      
      if (error) {
        console.error('Supabase insertion error:', {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }
      
      // If there's an initial phase, create it
      if (initialPhase && startDate && endDate) {
        await supabase.from('phases').insert({
          project_id: data.id,
          name: initialPhase,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          status: "not_started",
          progress: 0,
        });
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      closeCreateProjectModal();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      if (!project) return null;
      const { initialPhase, startDate, endDate, ...projectData } = values;
      const response = await apiRequest("PATCH", `/api/projects/${project.id}`, projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
      closeCreateProjectModal();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: ProjectFormValues) => {
    if (project) {
      updateMutation.mutateAsync(values);
    } else {
      createMutation.mutateAsync(values);
    }
  };

  return (
    <Dialog open={isCreateProjectModalOpen} onOpenChange={closeCreateProjectModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription>
            {project 
              ? "Edit your project details below."
              : "Fill in the details below to create a new project and add it to your timeline."}
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
                      {...field} 
                      rows={3}
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
                  <div className="flex space-x-2 mt-1">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`h-8 w-8 rounded-full ${
                          field.value === color.value ? "ring-2 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => form.setValue("color", color.value)}
                        aria-selected={field.value === color.value}
                      >
                        {field.value === color.value && (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 text-white" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!project && (
              <>
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
              </>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeCreateProjectModal}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {project ? "Update Project" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ProjectForm;
