
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [selectedRole, setSelectedRole] = useState<"employee" | "admin">("employee");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const { toast } = useToast();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setCaptcha(""); // Clear the input when captcha changes
  };

  // Generate initial captcha and set up auto-refresh
  useEffect(() => {
    generateCaptcha();
    
    // Change captcha every 30 seconds
    const interval = setInterval(generateCaptcha, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (captcha !== captchaValue) {
      toast({
        title: "Captcha mismatch",
        description: "Please enter the correct captcha",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        onAuthSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            employee_id: employeeId,
            role: selectedRole
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Please check your email to verify your account!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset email sent! Check your inbox.",
        });
        setShowForgotPassword(false);
        setForgotEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - SJVN Building Image */}
        <div 
          className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage: `url('/lovable-uploads/bcd649d2-2538-4209-bcd6-252828b86c63.png')`
          }}
        >
          <div className="absolute inset-0 bg-blue-900/20"></div>
          <div className="absolute top-8 left-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <div className="text-blue-500 font-bold text-sm">SJVN</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <div className="text-blue-500 font-bold text-xs">SJVN</div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-600 mt-1">Enter your email to reset password</p>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>

              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>

              <div className="mt-6 text-center text-sm text-gray-500">
                © 2025 SJVN Limited
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - SJVN Building Image */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('/lovable-uploads/bcd649d2-2538-4209-bcd6-252828b86c63.png')`
        }}
      >
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="absolute top-8 left-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
              <div className="text-blue-500 font-bold text-sm">SJVN</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <div className="text-blue-500 font-bold text-xs">SJVN</div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TimeTracker</h1>
              <p className="text-gray-600 mt-1">Welcome to SJVN TimeTracker</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="captcha">Enter Captcha</Label>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1 flex gap-2">
                        <div className="bg-gray-100 border rounded px-3 py-2 text-center font-mono text-sm flex-1">
                          {captchaValue}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={generateCaptcha}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      id="captcha"
                      type="text"
                      placeholder="Type here"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !loginEmail || !loginPassword || !captcha}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-select">Role</Label>
                    <Select value={selectedRole} onValueChange={(value: "employee" | "admin") => setSelectedRole(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee-id">
                      {selectedRole === "admin" ? "Admin ID" : "Employee ID"}
                    </Label>
                    <Input
                      id="employee-id"
                      type="text"
                      placeholder={`Enter your ${selectedRole === "admin" ? "admin" : "employee"} ID`}
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-500">
              © 2025 SJVN Limited
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
