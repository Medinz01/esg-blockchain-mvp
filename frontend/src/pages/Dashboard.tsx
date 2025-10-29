import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Wallet, Database, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ESGSubmissionForm } from "@/components/ESGSubmissionForm";
import { ESGRecordsTable } from "@/components/ESGRecordsTable";
import { CompanyRegistration } from "@/components/CompanyRegistration";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface BlockchainStats {
  totalCompanies: number;
  totalRecords: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect verifiers to verifier dashboard
    if (user && (user.role === 'verifier' || user.role === 'admin')) {
      navigate('/verifier-dashboard');
      return;
    }

    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/blockchain/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load network statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated 
        userRole={user.role} 
        userName={user.companyName}
        onLogout={handleLogout}
      />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Company Dashboard</h1>
          <p className="text-muted-foreground">Manage your ESG data on the blockchain</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Profile Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>{user.companyName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</p>
                <p className="blockchain-hash text-xs break-all bg-muted p-2 rounded font-mono">
                  {user.walletAddress}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Registration ID</p>
                <p className="text-sm font-medium">{user.registrationId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Role</p>
                <Badge variant="outline" className="w-full justify-center uppercase">
                  {user.role}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Blockchain Status</p>
                {user.isBlockchainRegistered ? (
                  <Badge variant="default" className="w-full justify-center bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Registered
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center bg-yellow-600 hover:bg-yellow-700">
                    <Clock className="mr-1 h-3 w-3" />
                    Not Registered
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total ESG Records</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stats?.totalRecords || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">On blockchain network</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Registered Companies</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stats?.totalCompanies || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Verified participants</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            {user.isBlockchainRegistered ? (
              <Tabs defaultValue="submit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="submit">Submit ESG Data</TabsTrigger>
                  <TabsTrigger value="records">My Records</TabsTrigger>
                </TabsList>
                <TabsContent value="submit" className="mt-6">
                  <ESGSubmissionForm />
                </TabsContent>
                <TabsContent value="records" className="mt-6">
                  <ESGRecordsTable />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <CardTitle>Blockchain Registration Required</CardTitle>
                  </div>
                  <CardDescription>
                    Complete blockchain registration to submit and verify ESG data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompanyRegistration />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
