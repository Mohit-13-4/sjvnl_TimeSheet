
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

interface LoginPageProps {
  onLogin: (role: "Employee" | "Admin") => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [selectedRole, setSelectedRole] = useState<"Employee" | "Admin" | "">("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaValue] = useState("118xyJ");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && username && password && captcha === captchaValue) {
      onLogin(selectedRole as "Employee" | "Admin");
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

      {/* Right side - Login Form */}
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
              <p className="text-gray-600 mt-1">Sign in to continue</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={selectedRole} onValueChange={(value: "Employee" | "Admin") => setSelectedRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot Password?
                </a>
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha">Enter Captcha</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 flex gap-2">
                    <div className="bg-gray-100 border rounded px-3 py-2 text-center font-mono text-sm flex-1">
                      {captchaValue}
                    </div>
                    <Button type="button" variant="outline" size="sm">
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
                disabled={!selectedRole || !username || !password || !captcha}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              © 2025 SJVN Limited
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
