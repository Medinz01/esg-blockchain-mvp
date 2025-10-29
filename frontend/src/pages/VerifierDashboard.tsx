import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, ListChecks, Timer, Database } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { VerifierRecordsTable } from "@/components/VerifierRecordsTable";

interface Stats {
  totalRecords: number;
  pendingRecords: number;
  verifiedRecords: number;
  verificationRate: number;
}

export default function VerifierDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "verifier" && user.role !== "admin") {
      toast.error("Access denied");
      navigate("/dashboard");
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await api.get("/api/verification/stats");
      setStats(response.data.stats);
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (user.role !== "verifier" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>
            Access denied. Only authorized verifiers can access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isAuthenticated 
        userRole={user.role} 
        userName={user.companyName || user.email}
        onLogout={() => { logout(); navigate("/login"); }}
      />

      <div className="container py-8">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold">Verifier Dashboard</h1>
            <p className="text-muted-foreground">Review and verify ESG data submissions</p>
          </div>
        </div>

        {/* Statistics cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-5">
              <div className="flex items-center gap-2 mb-1">
                <Database className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">{loading ? "..." : stats?.totalRecords || 0}</span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Total Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-5">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-semibold text-yellow-700">{loading ? "..." : stats?.pendingRecords || 0}</span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-lg font-semibold text-green-700">{loading ? "..." : stats?.verifiedRecords || 0}</span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-5">
              <div className="flex items-center gap-2 mb-1">
                <ListChecks className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">{loading ? "..." : stats?.verificationRate || 0}%</span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">Verification Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and records */}
        <Tabs defaultValue={tab} className="w-full" onValueChange={v => setTab(v as "pending" | "all")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending ({stats?.pendingRecords || 0})</TabsTrigger>
            <TabsTrigger value="all">All Records</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
            <VerifierRecordsTable mode="pending" />
          </TabsContent>
          <TabsContent value="all" className="mt-6">
            <VerifierRecordsTable mode="all" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
