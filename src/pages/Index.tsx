
import { useState } from "react";
import LoginPage from "../components/LoginPage";
import TimeTracker from "../components/TimeTracker";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<"Employee" | "Admin" | null>(null);

  const handleLogin = (role: "Employee" | "Admin") => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <TimeTracker userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
