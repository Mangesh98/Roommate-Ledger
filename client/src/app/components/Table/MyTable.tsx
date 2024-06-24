"use client";
import React, { useEffect, useState } from "react";
import { Member, Row } from "./GlobalTable";
import {  getMyEntryAction } from "@/app/lib/actions";

const MyTable = () => {
	const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
	const [rows, setRows] = useState<Row[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchEntries = async () => {
			try {
				const response = await getMyEntryAction();
				setRows(response.data);
			} catch (error) {
				console.error("Failed to fetch entries:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchEntries();
	}, []);

	const formatDate = (isoDate: string) => {
		const date = new Date(isoDate);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear().toString();
		return `${day}-${month}-${year}`; // Output: '24-06-2024'
	};

	const toggleRow = (index: number) => {
		const newExpandedRows = new Set(expandedRows);
		if (newExpandedRows.has(index)) {
			newExpandedRows.delete(index);
		} else {
			newExpandedRows.add(index);
		}
		setExpandedRows(newExpandedRows);
	};

	if (loading) {
		return <div>Loading...</div>;
	}
// My Table & Global Table Implemented 
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
								Amount
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => (
							<React.Fragment key={row._id}>
								<tr
									className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
									onClick={() => toggleRow(index)}
								>
									<td className="px-6 py-4">{formatDate(row.date)}</td>

									<td className="px-6 py-4">{row.description}</td>
									<td className="px-6 py-4">&#8377;{row.amount}</td>
								</tr>
								{expandedRows.has(index) && (
									<tr className="bg-gray-50 dark:bg-gray-700">
										<td className="px-6 py-4" colSpan={6}>
											<div>
												<h3 className="font-semibold text-gray-900 dark:text-white">
													Members:
												</h3>
												<ul className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-400">
													{row.members.map((member: Member, idx: number) => (
														<li key={idx} className="flex items-center">
															{member.paidStatus ? (
																<svg
																	className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 flex-shrink-0"
																	aria-hidden="true"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
																</svg>
															) : (
																<svg
																	className="w-3.5 h-3.5 me-2 text-gray-500 dark:text-gray-400 flex-shrink-0"
																	aria-hidden="true"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																	viewBox="0 0 20 20"
																>
																	<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
																</svg>
															)}
															{member.userName}
														</li>
													))}
												</ul>
											</div>
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
								&#8377;{rows.reduce((sum, row) => sum + row.amount, 0)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};

export default MyTable;
