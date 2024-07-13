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
import { useCookies } from "react-cookie";
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
import { AlignRight } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

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
		<nav className="bg-white border-gray-200 dark:bg-gray-900">
			<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
				<Link
					to="/"
					className="flex items-center space-x-3 rtl:space-x-reverse"
				>
					<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
						Roommate Ledger
					</span>
				</Link>
				<div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Avatar>
								<AvatarImage src="https://github.com/shadcn.png" />
								<AvatarFallback>Profile</AvatarFallback>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuLabel>
								<span className="block text-sm text-gray-900 dark:text-white">
									{currentUser.userName}
								</span>
								<span className="block text-sm  text-gray-500 truncate dark:text-gray-400">
									{currentUser.email}
								</span>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<button
									className="w-full text-left"
									onClick={() => setIsAlertDialogOpen(true)}
								>
									Logout
								</button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<div className="block md:hidden">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<AlignRight className="cursor-pointer" />
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuLabel>Menu</DropdownMenuLabel>
								<DropdownMenuSeparator />
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
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<div
					className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
					id="navbar-user"
				>
					<ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
						<li>
							<NavLink
								to="/room-entries"
								className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 md:dark:hover:bg-transparent dark:border-gray-700"
								style={({ isActive }) => ({
									color: isActive ? "#1d4ed8" : "white",
								})}
							>
								Room Entries
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/my-entries"
								className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 md:dark:hover:bg-transparent dark:border-gray-700"
								style={({ isActive }) => ({
									color: isActive ? "#1d4ed8" : "white",
								})}
							>
								My Entries
							</NavLink>
						</li>
						<li>
							<NavLink
								to="/ledger"
								className="block py-2 px-3 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 md:dark:hover:bg-transparent dark:border-gray-700"
								style={({ isActive }) => ({
									color: isActive ? "#1d4ed8" : "white",
								})}
							>
								Ledger
							</NavLink>
						</li>
					</ul>
				</div>
			</div>
			{/* The AlertDialog for logout */}
			<AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to logout?
						</AlertDialogTitle>
						<AlertDialogDescription>
							You will be logged out and redirected to the login page.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction onClick={logout}>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</nav>
	);
};

export default Navbar;
