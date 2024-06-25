import React from "react";
import GlobalTable from "./Table/GlobalTable";
import MyTable from "./Table/MyTable";
import Link from "next/link";
import Ledger from "./Table/Ledger";

const Room = () => {
	return (
		<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
			<h1>Room Name</h1>
			<div className="myTable mt-6">
				<Link
                    href="/new-entry"
					type="button"
					className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
				>
					Create New Entry
				</Link>
			</div>
			<div className="myTable mt-6">
				<MyTable />
			</div>
			<div className="globalTable mt-6">
				<GlobalTable />
			</div>
			<div className="globalTable mt-6">
				<Ledger />
			</div>
		</div>
	);
};

export default Room;
