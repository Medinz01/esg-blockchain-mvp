import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";

interface CompanyInfo {
  name: string;
  registrationId: string;
  walletAddress: string;
  registrationTime: number;
}

export function CompanyRegistration() {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (user?.isBlockchainRegistered) {
      loadCompanyInfo();
    }
  }, [user]);

  const loadCompanyInfo = async () => {
    try {
      const response = await api.get('/api/blockchain/company-info');
      setCompanyInfo(response.data.company);
    } catch (error) {
      console.error('Failed to load company info:', error);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setStep(1);

    try {
      const response = await api.post('/api/blockchain/register-company');
      
      if (response.data.success) {
        toast.success('Successfully registered on blockchain!');
        setStep(2);
        
        // Refresh user data
        setTimeout(() => {
          checkAuth();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.error || 'Registration failed');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  if (user?.isBlockchainRegistered && companyInfo) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle>Already Registered on Blockchain</CardTitle>
          </div>
          <CardDescription>
            Your company is verified on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Company Name</p>
            <p className="text-sm font-semibold">{companyInfo.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Registration ID</p>
            <p className="text-sm font-semibold">{companyInfo.registrationId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              {companyInfo.walletAddress}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Registered On</p>
            <p className="text-sm">
              {new Date(companyInfo.registrationTime * 1000).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {step === 0 && (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Review your information before registering on the blockchain. This action is permanent.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Company Name</p>
                <p className="text-sm font-semibold">{user?.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration ID</p>
                <p className="text-sm font-semibold">{user?.registrationId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {user?.walletAddress}
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert variant="destructive">
            <AlertDescription>
              <strong>Warning:</strong> Once registered, your company information will be permanently recorded on the blockchain and cannot be modified.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleRegister} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Register on Blockchain'
            )}
          </Button>
        </>
      )}

      {step === 1 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold mb-2">Processing Transaction...</p>
            <p className="text-sm text-muted-foreground text-center">
              Please wait while your registration is being confirmed on the blockchain
            </p>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">
              Registration Successful!
            </p>
            <p className="text-sm text-center text-green-700 dark:text-green-300">
              Your company has been permanently registered on the blockchain
            </p>
            <Badge variant="outline" className="mt-4">
              You can now submit ESG data
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
