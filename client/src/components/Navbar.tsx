import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { AlignRight, LogOut} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { cn } from "../lib/utils";
import { useCookies } from "react-cookie";

const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "relative px-3 py-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400",
        isActive && "text-blue-600 dark:text-blue-400 font-medium"
      )
    }
  >
    {({ isActive }) => (
      <>
        {children}
        {isActive && (
          <span className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 dark:from-blue-400/0 dark:via-blue-400/40 dark:to-blue-400/0" />
        )}
      </>
    )}
  </NavLink>
);

const Navbar = () => {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const navigate = useNavigate();
  const [, setCookie] = useCookies();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const handlePageChange = (page: string) => {
    navigate(`/${page.toLowerCase().replace(" ", "-")}`);
  };

  const logout = async () => {
    setCookie("token", "", { path: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/75 backdrop-blur-sm dark:bg-gray-900/75 dark:border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Roommate Ledger
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <NavItem to="/room-entries">Room Entries</NavItem>
            <NavItem to="/my-entries">My Entries</NavItem>
            <NavItem to="/ledger">Ledger</NavItem>
            <NavItem to="/payment-confirmation">Payment Confirmation</NavItem>
          </div>

          {/* User Menu & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    {currentUser.userName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAlertDialogOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    <AlignRight className="h-6 w-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuRadioGroup onValueChange={handlePageChange}>
                    <DropdownMenuRadioItem value="Room Entries">
                      Room Entries
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="My Entries">
                      My Entries
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Ledger">
                      Ledger
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Payment Confirmation">
                      Payment Confirmation
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of Roommate Ledger?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700 cursor-pointer"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};

export default Navbar;