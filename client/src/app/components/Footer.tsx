"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Footer = () => {
	const pathname = usePathname();

	const showNavbar = !(pathname === "/sign-in" || pathname === "/sign-up");

	const currentYear = new Date().getFullYear();
	return (
		<>
			{showNavbar && (
				<footer className="bg-white rounded-lg shadow dark:bg-gray-900 m-4">
					<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
						<hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
						<span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
							© {currentYear}{" "}
							<Link href="/" className="hover:underline">
								Roommate Ledger™
							</Link>
							. All Rights Reserved.
						</span>
					</div>
				</footer>
			)}
		</>
	);
};

export default Footer;
