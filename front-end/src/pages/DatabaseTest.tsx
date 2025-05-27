import React, { useState } from 'react';
import apiService, { RegisterRequest, Profile, Asset, Liability, ProfileDto } from '../services/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'error';
  message: string;
  details?: string;
}

const DatabaseTest = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    adminCreation: boolean | null;
    assetCreation: boolean | null;
    liabilityCreation: boolean | null;
    profileUpdate: boolean | null;
    adminRoleSet: boolean | null;
  }>({
    adminCreation: null,
    assetCreation: null,
    liabilityCreation: null,
    profileUpdate: null,
    adminRoleSet: null,
  });

  const addLog = (type: 'info' | 'success' | 'error', message: string, details?: string) => {
    const timestamp = new Date().toISOString();
    setLogs(prevLogs => [{ timestamp, type, message, details }, ...prevLogs]);
  };

  const createAdminUser = async () => {
    try {
      addLog('info', 'Creating admin user (admin@test.com)...');
      
      // Check if user already exists by trying to log in
      try {
        const loginResponse = await apiService.login({ 
          email: 'admin@test.com', 
          password: 'password' 
        });
        
        if (loginResponse.data.accessToken) {
          localStorage.setItem('token', loginResponse.data.accessToken);
          addLog('success', 'Admin user already exists, logged in successfully', 
            JSON.stringify(loginResponse.data, null, 2));
          setTestResults(prev => ({ ...prev, adminCreation: true }));
          return loginResponse.data;
        }
      } catch (loginError: any) {
        addLog('info', 'Admin login failed, will attempt to create user', 
          loginError.message || 'Unknown login error');
      }

      // Create admin user
      const registerData: RegisterRequest = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@test.com',
        password: 'password',
        phone: '1234567890'
      };
      
      const response = await apiService.register(registerData);
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        addLog('success', 'Admin user created successfully', 
          JSON.stringify(response.data, null, 2));
        setTestResults(prev => ({ ...prev, adminCreation: true }));
        
        // Update user role to ADMIN if needed
        // This might require a separate API call depending on your backend implementation
        
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      const errorDetails = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.message || 'Unknown error';
      
      addLog('error', 'Failed to create admin user', errorDetails);
      setTestResults(prev => ({ ...prev, adminCreation: false }));
      console.error('Admin creation error:', error);
      return null;
    }
  };

  const createTestAsset = async (profileId: string) => {
    try {
      addLog('info', `Creating test asset for profile ${profileId}...`);
      
      const assetData: Asset = {
        assetType: 'TEST_ASSET',
        currentValue: 100000,
        originalPrice: 80000,
        yearPurchased: 2020,
        ownershipPercentage: 100,
        incomeAmount: 500,
        incomeFrequency: 'MONTHLY',
        description: 'Test asset created for database permission test'
      };
      
      const response = await apiService.createAsset(assetData);
      
      addLog('success', 'Test asset created successfully', 
        JSON.stringify(response.data, null, 2));
      setTestResults(prev => ({ ...prev, assetCreation: true }));
      
      return response.data;
    } catch (error: any) {
      const errorDetails = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.message || 'Unknown error';
      
      addLog('error', 'Failed to create test asset', errorDetails);
      setTestResults(prev => ({ ...prev, assetCreation: false }));
      console.error('Asset creation error:', error);
      
      return null;
    }
  };

  const createTestLiability = async (profileId: string) => {
    try {
      addLog('info', `Creating test liability for profile ${profileId}...`);
      
      const liabilityData: Liability = {
        liabilityType: 'TEST_LIABILITY',
        loanBalance: 50000,
        lenderType: 'BANK',
        interestRate: 4.5,
        termType: 'YEARS',
        repaymentAmount: 300,
        repaymentFrequency: 'MONTHLY',
        loanType: 'PERSONAL_LOAN',
        description: 'Test liability created for database permission test'
      };
      
      const response = await apiService.createLiability(liabilityData);
      
      addLog('success', 'Test liability created successfully', 
        JSON.stringify(response.data, null, 2));
      setTestResults(prev => ({ ...prev, liabilityCreation: true }));
      
      return response.data;
    } catch (error: any) {
      const errorDetails = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.message || 'Unknown error';
      
      addLog('error', 'Failed to create test liability', errorDetails);
      setTestResults(prev => ({ ...prev, liabilityCreation: false }));
      console.error('Liability creation error:', error);
      
      return null;
    }
  };

  const updateProfile = async (profileId: string) => {
    try {
      addLog('info', `Updating profile ${profileId}...`);
      
      // First get the current profile
      const profileResponse = await apiService.getProfileById(profileId);
      const currentProfile = profileResponse.data;
      
      // Make some changes to the profile
      const updatedProfile: Profile = {
        ...currentProfile,
        address: `Test address updated at ${new Date().toISOString()}`,
        occupation: 'Test Occupation'
      };
      
      const response = await apiService.updateProfile(profileId, updatedProfile);
      
      addLog('success', 'Profile updated successfully', 
        JSON.stringify(response.data, null, 2));
      setTestResults(prev => ({ ...prev, profileUpdate: true }));
      
      return response.data;
    } catch (error: any) {
      const errorDetails = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.message || 'Unknown error';
      
      addLog('error', 'Failed to update profile', errorDetails);
      setTestResults(prev => ({ ...prev, profileUpdate: false }));
      console.error('Profile update error:', error);
      
      return null;
    }
  };

  const setUserAsAdmin = async (profileId: string) => {
    try {
      addLog('info', `Setting user ${profileId} as admin...`);
      
      const response = await apiService.setAdminRole(profileId);
      
      // Make sure we handle the profile response correctly (now a ProfileDto)
      const profileData = response.data;
      addLog('success', `User role set to ${profileData.role} successfully`, 
        JSON.stringify(profileData, null, 2));
      setTestResults(prev => ({ ...prev, adminRoleSet: true }));
      
      return profileData;
    } catch (error: any) {
      const errorDetails = error.response?.data 
        ? JSON.stringify(error.response.data, null, 2) 
        : error.message || 'Unknown error';
      
      addLog('error', 'Failed to set user as admin', errorDetails);
      setTestResults(prev => ({ ...prev, adminRoleSet: false }));
      console.error('Set admin error:', error);
      
      return null;
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    addLog('info', 'Starting database permission tests...');
    
    try {
      // Reset test results
      setTestResults({
        adminCreation: null,
        assetCreation: null,
        liabilityCreation: null,
        profileUpdate: null,
        adminRoleSet: null,
      });
      
      // Step 1: Create admin user or login if exists
      const authResponse = await createAdminUser();
      
      if (!authResponse) {
        addLog('error', 'Tests aborted: Failed to create or log in as admin user');
        setIsLoading(false);
        return;
      }
      
      const profileId = authResponse.id;
      
      // Step 2: Create a test asset
      await createTestAsset(profileId);
      
      // Step 3: Create a test liability
      await createTestLiability(profileId);
      
      // Step 4: Update the profile
      await updateProfile(profileId);
      
      // Step 5: Set user as admin
      await setUserAsAdmin(profileId);
      
      addLog('info', 'All tests completed');
    } catch (error: any) {
      addLog('error', 'Error running tests', error.message || 'Unknown error');
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="outline">Not Run</Badge>;
    return status ? 
      <Badge className="bg-green-100 text-green-800">Success</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Database Permission Test</h1>
      <p className="text-gray-600 mb-8">
        This page tests database write permissions by creating an admin user and test data.
        Check the logs below for detailed error information.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Run database permission tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Admin Creation</span>
                  {getStatusBadge(testResults.adminCreation)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Asset Creation</span>
                  {getStatusBadge(testResults.assetCreation)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Liability Creation</span>
                  {getStatusBadge(testResults.liabilityCreation)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile Update</span>
                  {getStatusBadge(testResults.profileUpdate)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Role Set</span>
                  {getStatusBadge(testResults.adminRoleSet)}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={runAllTests} 
                disabled={isLoading} 
                className="w-full"
              >
                {isLoading ? 'Running Tests...' : 'Run All Tests'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Test Logs</CardTitle>
              <CardDescription>
                Detailed logs of test operations and errors
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] p-0">
              <ScrollArea className="h-full max-h-[500px] p-4">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <span>No logs yet. Run tests to see results.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {logs.map((log, index) => (
                      <div key={index} className="pb-2">
                        <div className="flex items-start gap-2">
                          {log.type === 'error' ? (
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                          ) : log.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs text-blue-600">i</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className={`font-medium ${
                                log.type === 'error' ? 'text-red-600' : 
                                log.type === 'success' ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                {log.message}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            {log.details && (
                              <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                {log.details}
                              </pre>
                            )}
                          </div>
                        </div>
                        {index < logs.length - 1 && <Separator className="mt-2" />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Database Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Common Permission Issues</h3>
                <ul className="list-disc ml-6 mt-2">
                  <li>Database user lacks proper permissions (INSERT, UPDATE, DELETE)</li>
                  <li>PostgreSQL role permissions are too restrictive</li>
                  <li>Schema ownership issues</li>
                  <li>Database connection issues in production environment</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Fixing PostgreSQL Permissions</h3>
                <pre className="bg-gray-50 p-3 rounded text-sm mt-2 overflow-x-auto">
{`-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Check current permissions
\\du

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE property_db TO property_user;

-- Connect to the specific database
\\c property_db

-- Grant privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO property_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO property_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO property_user;

-- Make sure the user owns the tables
ALTER TABLE profiles OWNER TO property_user;
ALTER TABLE assets OWNER TO property_user;
ALTER TABLE liabilities OWNER TO property_user;
ALTER TABLE portfolios OWNER TO property_user;
ALTER TABLE properties OWNER TO property_user;

-- If using schemas other than public, repeat for those schemas`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseTest; 