import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Leaf, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    registrationId: "",
    email: "",
    password: "",
    confirmPassword: "",
    walletAddress: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.companyName || !formData.registrationId) {
      toast.error("Please fill in all company details");
      return false;
    }
    if (formData.companyName.length < 2) {
      toast.error("Company name must be at least 2 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all account details");
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.walletAddress) {
      toast.error("Please enter your wallet address");
      return false;
    }

    // Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(formData.walletAddress)) {
      toast.error("Please enter a valid Ethereum address (0x...)");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      // Prepare data for backend
      const registrationData = {
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        walletAddress: formData.walletAddress,
        registrationId: formData.registrationId,
      };

      const result = await register(registrationData);

      if (result.success) {
        toast.success("Registration successful! Please login to continue.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(result.error || "Registration failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="space-y-1">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Register Your Company</CardTitle>
            <CardDescription className="text-center">
              Join the blockchain-verified ESG platform
            </CardDescription>
            <div className="pt-4">
              <Progress value={progress} className="h-2" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span className={step >= 1 ? "text-primary font-medium" : ""}>Company Details</span>
                <span className={step >= 2 ? "text-primary font-medium" : ""}>Account Setup</span>
                <span className={step >= 3 ? "text-primary font-medium" : ""}>Blockchain Info</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Corporation"
                      value={formData.companyName}
                      onChange={(e) => updateField("companyName", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your official company name as registered
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationId">Company Registration ID *</Label>
                    <Input
                      id="registrationId"
                      placeholder="REG-123456"
                      value={formData.registrationId}
                      onChange={(e) => updateField("registrationId", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your government-issued company registration number
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contact@company.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Ethereum Wallet Address *</Label>
                    <Input
                      id="walletAddress"
                      placeholder="0x1234567890abcdef1234567890abcdef12345678"
                      className="font-mono text-sm"
                      value={formData.walletAddress}
                      onChange={(e) => updateField("walletAddress", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your Ethereum wallet address for blockchain identity and ESG data verification
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>💡 Don't have a wallet?</strong> You can use one of the test accounts from Ganache blockchain for development purposes.
                    </p>
                  </div>
                  <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
                    <p className="text-sm text-foreground">
                      <strong>⚠️ Important:</strong> All data submitted to the blockchain is permanent and immutable.
                      Please ensure your information is accurate before proceeding.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between gap-4">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    className="ml-auto"
                    disabled={isLoading}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="ml-auto"
                  >
                    {isLoading ? "Registering..." : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Complete Registration
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
