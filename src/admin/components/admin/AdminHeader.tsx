import { Bell, Search, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/admin/context/AdminContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/admin/lib/utils";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/admin/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { sidebarCollapsed, quotes, products } = useAdmin();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalNotifications = newQuotes + lowStockProducts;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        sidebarCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Title */}
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, quotes, orders..."
              className="w-80 pl-9 bg-muted/50 border-border"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {totalNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {newQuotes > 0 && (
                <DropdownMenuItem className="flex items-start gap-3 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/20">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{newQuotes} New Quote Request{newQuotes > 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </div>
                </DropdownMenuItem>
              )}
              {lowStockProducts > 0 && (
                <DropdownMenuItem className="flex items-start gap-3 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-warning/20">
                    <Bell className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{lowStockProducts} Low Stock Alert{lowStockProducts > 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted-foreground">Products need restocking</p>
                  </div>
                </DropdownMenuItem>
              )}
              {totalNotifications === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden text-sm font-medium md:block">Admin User</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Help & Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
