
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Captcha state
  const [captcha, setCaptcha] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    employeeId: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    employeeId: "",
    password: "",
    captchaInput: ""
  });

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setCaptcha("");
    setSignInData(prev => ({ ...prev, captchaInput: "" }));
  };

  useEffect(() => {
    generateCaptcha();
    const interval = setInterval(generateCaptcha, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!signUpData.role) {
      toast({
        title: "Error",
        description: "Please select a role",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate email from employee ID
      const email = `${signUpData.employeeId}@sjvn.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: signUpData.password,
        options: {
          data: {
            employee_id: signUpData.employeeId,
            full_name: signUpData.fullName,
            role: signUpData.role
          },
          emailRedirectTo: undefined // Disable email confirmation
        }
      });

      if (error) {
        if (error.message.includes("duplicate key value")) {
          toast({
            title: "Sign Up Failed",
            description: "Employee ID already exists. Please use a different Employee ID.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign Up Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data.user) {
        toast({
          title: "Success",
          description: "Account created successfully! You can now sign in.",
        });
        // Clear form
        setSignUpData({
          employeeId: "",
          fullName: "",
          password: "",
          confirmPassword: "",
          role: ""
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signInData.captchaInput !== captchaValue) {
      toast({
        title: "Error",
        description: "Invalid captcha. Please try again.",
        variant: "destructive"
      });
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    try {
      // Generate email from employee ID
      const email = `${signInData.employeeId}@sjvn.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: signInData.password
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Configuration Issue",
            description: "Email confirmation is still enabled in Supabase. Please contact your administrator to disable email confirmation in Authentication settings.",
            variant: "destructive"
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Sign In Failed",
            description: "Invalid Employee ID or password. Please check your credentials.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sign In Failed",
            description: error.message,
            variant: "destructive"
          });
        }
        generateCaptcha();
      } else if (data.session) {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        onAuthSuccess();
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Right side - Auth Forms */}
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
              <p className="text-gray-600 mt-1">Employee Management System</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-employee-id">Employee ID</Label>
                    <Input
                      id="signin-employee-id"
                      type="text"
                      placeholder="Enter your employee ID"
                      value={signInData.employeeId}
                      onChange={(e) => setSignInData(prev => ({ ...prev, employeeId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
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
                      value={signInData.captchaInput}
                      onChange={(e) => setSignInData(prev => ({ ...prev, captchaInput: e.target.value }))}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !signInData.employeeId || !signInData.password || !signInData.captchaInput}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee-id">Employee ID</Label>
                    <Input
                      id="employee-id"
                      type="text"
                      placeholder="Enter your employee ID"
                      value={signUpData.employeeId}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, employeeId: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Select Role</Label>
                    <Select value={signUpData.role} onValueChange={(value) => setSignUpData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Sign Up"}
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
