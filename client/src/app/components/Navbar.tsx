"use client";
import Link from "next/link";
import React from "react";
import { logoutAction } from "../lib/usersAction";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Navbar = () => {
	const router = useRouter();
	const pathname = usePathname();

	// Use conditional rendering to show/hide navbar based on pathname
	const showNavbar = !(pathname === "/sign-in" || pathname === "/sign-up");

	async function logout() {
		const confirmed = confirm("Are you sure you want to logout?");
		if (confirmed) {
			const logoutResult = await logoutAction();
			if (logoutResult.result) {
				router.push("/sign-in");
				toast.success("Logout successful!", { theme: "dark" });
			}
		}
	}
	return (
		<>
			{showNavbar && (
				<nav className="bg-white border-gray-200 dark:bg-gray-900">
					<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
						<Link
							href="/"
							className="flex items-center space-x-3 rtl:space-x-reverse"
						>
							<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
								Roommate Ledger
							</span>
						</Link>
						<div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
							<button
								onClick={logout}
								type="button"
								className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
							>
								Logout
							</button>
						</div>
					</div>
				</nav>
			)}
		</>
	);
};

export default Navbar;
