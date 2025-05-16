
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";
import { SignUpModal } from "@/components/SignUpModal";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButton() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const openLoginModal = () => {
    setSignUpModalOpen(false);
    setLoginModalOpen(true);
  };

  const openSignUpModal = () => {
    setLoginModalOpen(false);
    setSignUpModalOpen(true);
  };

  if (user) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm">
              Signed in as <strong>{user.name}</strong>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground text-xs truncate">
              {user.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setLoginModalOpen(true)}
      >
        <LogIn className="h-5 w-5" />
      </Button>
      <LoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen} 
        onSwitchToSignUp={openSignUpModal} 
      />
      <SignUpModal 
        open={signUpModalOpen} 
        onOpenChange={setSignUpModalOpen}
        onSwitchToLogin={openLoginModal} 
      />
    </>
  );
}
