import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';

const Dashboard = () => {
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to timeline page, which is our main dashboard
    setLocation('/timeline');
  }, [setLocation]);
  
  return (
    <>
      <Helmet>
        <title>Dashboard - ProjectSync</title>
        <meta name="description" content="Dashboard for ProjectSync - A Gantt-style timeline management tool for business analysts and project managers." />
      </Helmet>
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    </>
  );
};

export default Dashboard;
