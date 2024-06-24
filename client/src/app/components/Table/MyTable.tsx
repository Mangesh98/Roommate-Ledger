"use client";
import React, { useState } from "react";

const MyTable = () => {
	const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

	function getDate(): string {
		const today: Date = new Date();
		let dd: number | string = today.getDate();
		let mm: number | string = today.getMonth() + 1; // January is 0!
		const yyyy: number = today.getFullYear();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		const formattedDate: string = mm + "-" + dd + "-" + yyyy;
		return formattedDate;
	}

	const date = getDate();

	const toggleRow = (index: number) => {
		const newExpandedRows = new Set(expandedRows);
		if (newExpandedRows.has(index)) {
			newExpandedRows.delete(index);
		} else {
			newExpandedRows.add(index);
		}
		setExpandedRows(newExpandedRows);
	};

	const rows = [
		{ date, description: "Chicken", price: 400 },
		{ date, description: "Chicken", price: 400 },
		{ date, description: "Chicken", price: 400 },
		{ date, description: "Chicken", price: 400 },
	];

	return (
		<div>
			<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
				<h2 className="mb-2">My Table</h2>
				<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" className="px-6 py-3">
								Date
							</th>
							<th scope="col" className="px-6 py-3">
								Description
							</th>
							<th scope="col" className="px-6 py-3">
								Price
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => (
							<React.Fragment key={index}>
								<tr
									className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
									onClick={() => toggleRow(index)}
								>
									<td className="px-6 py-4">{row.date}</td>
									<td className="px-6 py-4">{row.description}</td>
									<td className="px-6 py-4">&#8377;{row.price}</td>
								</tr>
								{expandedRows.has(index) && (
									<tr className="bg-gray-50 dark:bg-gray-700">
										<td className="px-6 py-4" colSpan={3}>
											Additional information about {row.description}...
										</td>
									</tr>
								)}
							</React.Fragment>
						))}
					</tbody>
					<tfoot>
						<tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 ">
							<th scope="row" className="px-6 py-3 text-base">
								Total
							</th>
							<td className="px-6 py-3"></td>
							<td className="px-6 py-3">
								&#8377;{rows.reduce((sum, row) => sum + row.price, 0)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};

export default MyTable;
