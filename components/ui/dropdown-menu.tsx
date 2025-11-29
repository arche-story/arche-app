import { Children } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DropdownMenuProps {
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isActive?: boolean;
}

interface DropdownMenuItemProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

// A simplified dropdown menu for navigation with external state management
export function DropdownMenu({ label, children, isOpen, onToggle, isActive = false }: DropdownMenuProps) {
  const pathname = usePathname();

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "px-3 py-1 rounded-full text-sm transition-colors",
          isActive
            ? "bg-arche-gold/20 text-arche-gold border border-arche-gold/30"
            : "text-white/60 hover:text-white hover:bg-white/5"
        )}
      >
        {label}
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#0F213E]/95 backdrop-blur border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ href, children, onClick, isActive = false }: DropdownMenuItemProps) {
  const pathname = usePathname();
  const isCurrentActive = isActive || pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "block px-4 py-3 text-sm transition-colors hover:bg-white/5 border-b border-white/5 last:border-b-0",
        isCurrentActive ? "text-arche-gold bg-white/5" : "text-white/80"
      )}
    >
      {children}
    </Link>
  );
}