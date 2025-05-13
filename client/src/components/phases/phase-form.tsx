import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertPhaseSchema, Phase } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const phaseFormSchema = insertPhaseSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

type PhaseFormValues = z.infer<typeof phaseFormSchema>;

interface PhaseFormProps {
  phase?: Phase;
}

export function PhaseForm({ phase }: PhaseFormProps) {
  const { toast } = useToast();
  const { 
    closeCreatePhaseModal, 
    isCreatePhaseModalOpen, 
    selectedProject 
  } = useAppStore();

  const projectId = selectedProject?.id;

  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseFormSchema),
    defaultValues: phase ? {
      ...phase,
      startDate: format(new Date(phase.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(phase.endDate), "yyyy-MM-dd"),
    } : {
      name: "",
      projectId,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(addDays(new Date(), 30), "yyyy-MM-dd"),
      deliverable: "",
      responsible: "",
      status: "not_started",
      progress: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: PhaseFormValues) => {
      if (!projectId) return null;
      
      // Convert string dates to Date objects
      const formattedValues = {
        ...values,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        projectId,
      };
      
      const response = await apiRequest("POST", `/api/projects/${projectId}/phases`, formattedValues);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'phases'] });
      toast({
        title: "Phase created",
        description: "Your phase has been created successfully.",
      });
      closeCreatePhaseModal();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create phase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: PhaseFormValues) => {
      if (!phase) return null;
      
      // Convert string dates to Date objects
      const formattedValues = {
        ...values,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
      };
      
      const response = await apiRequest("PATCH", `/api/phases/${phase.id}`, formattedValues);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'phases'] });
      toast({
        title: "Phase updated",
        description: "Your phase has been updated successfully.",
      });
      closeCreatePhaseModal();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update phase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PhaseFormValues) => {
    if (phase) {
      updateMutation.mutateAsync(values);
    } else {
      createMutation.mutateAsync(values);
    }
  };

  if (!projectId && !phase) {
    return null;
  }

  return (
    <Dialog open={isCreatePhaseModalOpen} onOpenChange={closeCreatePhaseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{phase ? "Edit Phase" : "Create New Phase"}</DialogTitle>
          <DialogDescription>
            {phase 
              ? "Edit your phase details below."
              : `Add a new phase to ${selectedProject?.name || "your project"}.`}
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
                      placeholder="Describe the deliverable for this phase" 
                      {...field} 
                      rows={2}
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
                  <FormLabel>Responsible</FormLabel>
                  <FormControl>
                    <Input placeholder="Who is responsible for this phase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
              <FormField
                control={form.control}
                name="progress"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="5"
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={closeCreatePhaseModal}
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
                {phase ? "Update Phase" : "Create Phase"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default PhaseForm;
