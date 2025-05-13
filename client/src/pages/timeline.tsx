import { Helmet } from 'react-helmet';
import ProjectTimeline from '@/components/project/ProjectTimeline';
import TaskDrawer from '@/components/project/TaskDrawer';
import EditProjectModal from '@/components/project/EditProjectModal';

const Timeline = () => {
  return (
    <>
      <Helmet>
        <title>Project Timeline - ProjectSync</title>
        <meta name="description" content="View and manage all your projects on a Gantt-style timeline with ProjectSync." />
      </Helmet>
      <ProjectTimeline />
      <TaskDrawer />
      <EditProjectModal />
    </>
  );
};

export default Timeline;
