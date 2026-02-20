"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Heart,
  Activity,
  CreditCard,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

interface UserProfileDialogProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function UserProfileDialog({
  user,
  open,
  setOpen,
}: UserProfileDialogProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const menuItems = [
    {
      icon: User,
      label: "Profile",
      description: "Account preferences",
      onClick: () => router.push("/profile"),
    },
    {
      icon: Heart,
      label: "Saved Properties",
      description: "Your favorite listings",
      onClick: () => router.push("/saved-properties"),
    },
    {
      icon: Activity,
      label: "Recent Activity",
      description: "Your browsing history",
      onClick: () => router.push("/recent-activity"),
    },
    {
      icon: CreditCard,
      label: "Subscription",
      description: "Manage your plan",
      onClick: () => router.push("/subscription"),
    },
  ];

  const handleItemClick = (onClick: () => void) => {
    onClick();
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full hover:bg-transparent focus-visible:ring-0"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt="User avatar" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* User Info Section */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt="User avatar" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Menu Options */}
        <div className="py-0">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item.onClick)}
                className="w-full flex items-center justify-between px-2 py-3 text-left hover:bg-cyan-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 group-hover:bg-cyan-200 transition-colors">
                    <Icon className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
              </button>
            );
          })}
        </div>

        <DropdownMenuSeparator />

        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-600 hover:bg-transparent focus-visible:ring-0"
          onClick={() => {
            signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
