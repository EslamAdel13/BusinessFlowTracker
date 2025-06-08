import { FC } from 'react';
import { Project, Phase } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import DraggablePhaseBar from './DraggablePhaseBar';
import CreatePhaseModal from './CreatePhaseModal';

interface ProjectRowProps {
  project: Project;
  phases: Phase[];
  timelineStartDate: Date;
  monthWidth?: number;
}

const ProjectRow: FC<ProjectRowProps> = ({ project, phases, timelineStartDate, monthWidth = 100 }) => {
  const { selectProject, selectPhase } = useProjectStore();
  const { openModal } = useUIStore();
  
  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectProject(project);
    openModal('editProject');
  };
  
  const handleAddPhase = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Add Phase clicked for project:', project);
    selectProject(project);
    openModal('createPhase');
  };

  return (
    <div className="hover:bg-gray-50 border-b border-gray-200">
      <div className="flex items-center">
        <div className="w-64 pl-6 pr-2 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div 
              className="h-3 w-3 rounded-full mr-3"
              style={{ backgroundColor: project.color || '#6366f1' }}
            ></div>
            <div>
              <div className="text-sm font-medium text-gray-900">{project.name}</div>
              <div className="text-xs text-gray-500">{project.description}</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <div className="timeline-months" style={{ height: '60px', position: 'relative', width: `${phases.length ? phases.length * monthWidth : 12 * monthWidth}px`, minWidth: `${12 * monthWidth}px` }}>
            {phases.map((phase) => (
              <DraggablePhaseBar
                key={phase.id}
                phase={phase}
                timelineStartDate={timelineStartDate}
                monthWidth={monthWidth}
                onClick={() => {
                  selectPhase(phase);
                  openModal('taskDrawer');
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="pr-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:text-primary-600 mr-3"
            onClick={handleEditProject}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span className="sr-only">Edit project</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:text-primary-600"
            onClick={handleAddPhase}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="sr-only">Add phase</span>
          </Button>
        </div>
      </div>
      
      <CreatePhaseModal />
    </div>
  );
};

export default ProjectRow;
