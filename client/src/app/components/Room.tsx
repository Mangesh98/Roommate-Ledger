import Link from "next/link";
import React from "react";
import GlobalTable from "./Table/GlobalTable";
import MyTable from "./Table/MyTable";

const Room = () => {
	return (
		<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
			<h1>Room Name</h1>
			<div className="myTable mt-6">
				<MyTable />
			</div>
			<div className="globalTable mt-6">
				<GlobalTable />
			</div>
		</div>
	);
};

export default Room;
