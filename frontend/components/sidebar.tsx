"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/loading", label: "Loading", icon: LayoutDashboard },
  { href: "/settings", label: "Configuracoes", icon: Settings },
];

function NavLink({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-sidebar">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-4 border-b">
            <Link href="/" className="text-xl font-bold">
              Projeto
            </Link>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} isActive={pathname === item.href} />
            ))}
          </nav>
          <div className="p-4 border-t">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-16 px-4 border-b bg-background">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center h-16 px-4 border-b">
                <Link href="/" className="text-xl font-bold" onClick={() => setOpen(false)}>
                  Projeto
                </Link>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.href} onClick={() => setOpen(false)}>
                    <NavLink {...item} isActive={pathname === item.href} />
                  </div>
                ))}
              </nav>
              <div className="p-4 border-t">
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <span className="ml-2 text-xl font-bold">Projeto</span>
      </div>
    </>
  );
}
