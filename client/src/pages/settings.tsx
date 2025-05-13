import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import LogoUpload from '@/components/ui/logo-upload';

const Settings = () => {
  const { user } = useAuthStore();
  const { timelineStartDate, setTimelineStartDate, companyLogo, accentColor } = useUIStore();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('');
  const [isUserUpdating, setIsUserUpdating] = useState(false);
  
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || '');
      setRole(user.user_metadata?.role as string || '');
    }
  }, [user]);
  
  const handleSaveUserProfile = async () => {
    setIsUserUpdating(true);
    try {
      // In a real app, this would update the user profile in Supabase
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUserUpdating(false);
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setTimelineStartDate(date);
      toast({
        title: 'Timeline start date updated',
        description: `Timeline will now start from ${format(date, 'MMMM yyyy')}.`,
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings - ProjectSync</title>
        <meta name="description" content="Configure your ProjectSync settings and preferences." />
      </Helmet>
      
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Configure your application settings and preferences
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 pb-6">
        <Tabs defaultValue="appearance">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how ProjectSync looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Company Branding</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <LogoUpload />
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Current Theme</h4>
                      {companyLogo ? (
                        <div className="flex items-center gap-4">
                          <div className="border border-gray-200 rounded-md p-2 w-16 h-16 flex items-center justify-center">
                            <img 
                              src={companyLogo} 
                              alt="Company Logo" 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          
                          {accentColor && (
                            <div className="flex gap-2 items-center">
                              <div 
                                className="w-10 h-10 rounded-full border border-gray-200" 
                                style={{ backgroundColor: accentColor }}
                              ></div>
                              <div className="text-sm text-gray-700">
                                <div>Primary Color</div>
                                <div className="font-mono text-xs text-gray-500">{accentColor}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No company logo uploaded yet. Upload a logo to generate a custom theme.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                      Light Mode
                    </Button>
                    
                    <Button variant="outline" className="justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                      Dark Mode
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Dark mode is coming soon in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                    <p className="text-xs text-gray-500">Your email address cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Job Title / Role</Label>
                    <Input 
                      id="role" 
                      value={role} 
                      onChange={(e) => setRole(e.target.value)} 
                      placeholder="e.g. Project Manager"
                    />
                  </div>
                </div>
                
                <div>
                  <Button onClick={handleSaveUserProfile} disabled={isUserUpdating}>
                    {isUserUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-4">Danger Zone</h3>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    This will permanently delete your account and all associated data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Timeline Settings</CardTitle>
                <CardDescription>
                  Configure how the timeline displays your projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="timeline-start">Timeline Start Date</Label>
                  <div className="w-full max-w-xs">
                    <DatePicker 
                      date={timelineStartDate} 
                      onSelect={handleDateChange} 
                      captionLayout="dropdown-buttons"
                      fromYear={2020}
                      toYear={2030}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This determines the start month of your timeline view
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-view">Default View</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zM8 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zM15 3a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                      </svg>
                      Timeline
                    </Button>
                    
                    <Button variant="outline" className="justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      My Tasks
                    </Button>
                    
                    <Button variant="outline" className="justify-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                      </svg>
                      Projects
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-base font-medium mb-2">Coming in Future Updates</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Slack/Jira/Azure/Calendar integration
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Project sharing and collaboration
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enhanced reporting and analytics
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Settings;
