"use client";
import {
	deleteEntryAction,
	getEntryAction,
	updateEntryAction,
} from "@/app/lib/entryActions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export interface Member {
	userId: string;
	userName: string;
	paidStatus: boolean;
}
interface CurrentUser {
	id: string;
	name: string;
	roomId: string;
}
export interface Row {
	_id: string;
	date: string;
	name: string;
	room: string;
	description: string;
	amount: number;
	status: boolean;
	paidBy: string;
	members: Member[];
}
export interface UpdateEntry {
	entryId: string;
	paidBy: string;
	amount: number;
}
const GlobalTable = () => {
	const router = useRouter();
	const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
	const [rows, setRows] = useState<Row[]>([]);
	const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [checkboxStates, setCheckboxStates] = useState<{
		[key: string]: boolean;
	}>({});

	const formatDate = (isoDate: string) => {
		const date = new Date(isoDate);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear().toString();
		return `${day}-${month}-${year}`; // Output: '24-06-2024'
	};

	const toggleRow = (index: number) => {
		setExpandedRows((prev) => {
			const newExpandedRows = new Set(prev);
			newExpandedRows.has(index)
				? newExpandedRows.delete(index)
				: newExpandedRows.add(index);
			return newExpandedRows;
		});
	};

	const fetchEntries = async () => {
		try {
			const response = await getEntryAction();
			if (response.error) {
				toast.error("Something went Wrong", { theme: "dark" });
			} else {
				setRows(response.data);
				setCurrentUser(response.user);
			}
		} catch (error) {
			toast.error("Failed to fetch entries: " + error, { theme: "dark" });
			console.error("Failed to fetch entries:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCheckboxChange = async (data: Row) => {
		const confirmed = confirm("Update the record as paid?");
		if (confirmed) {
			const updateRecord: UpdateEntry = {
				entryId: data._id,
				paidBy: data.paidBy,
				amount: Math.round(data.amount / data.members.length),
			};
			const updateEntryStatus = await updateEntryAction(updateRecord);
			if (updateEntryStatus.success) {
				toast.success("Record updated successfully", { theme: "dark" });
				await fetchEntries();
			} else {
				toast.error("Something went wrong", { theme: "dark" });
			}
		} else {
			setCheckboxStates((prev) => ({ ...prev, [data._id]: false }));
		}
	};

	const handleDeleteClick = async (id: string) => {
		const confirmed = confirm("Are you sure you want to delete this Entry?");
		if (confirmed) {
			try {
				const deleteResult = await deleteEntryAction(id);
				if (deleteResult.success) {
					const newRows = rows.filter((row) => row._id !== id);
					setRows(newRows);
					toast.success("Entry Deleted successfully!", { theme: "dark" });
				} else {
					toast.error("Something went wrong", { theme: "dark" });
				}
			} catch (error) {
				toast.error("Failed to delete entry: " + error, { theme: "dark" });
				console.error("Failed to delete entry:", error);
			}
		}
	};

	useEffect(() => {
		setLoading(true);
		fetchEntries();
	}, []);

	useEffect(() => {
		const initialCheckboxStates = rows.reduce((acc, row) => {
			acc[row._id] = row.status;
			return acc;
		}, {} as { [key: string]: boolean });
		setCheckboxStates(initialCheckboxStates);
	}, [rows]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
				<h2 className="mb-2">Global Table</h2>
				<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" className="px-6 py-3">
								Date
							</th>
							<th scope="col" className="px-6 py-3">
								Name
							</th>
							<th scope="col" className="px-6 py-3">
								मकसद
							</th>
							<th scope="col" className="px-6 py-3">
								Amount
							</th>
							<th scope="col" className="px-6 py-3">
								Status
							</th>
							<th scope="col" className="px-6 py-3">
								Delete
							</th>
						</tr>
					</thead>
					<tbody>
						{rows.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 px-6 py-4 text-center"
								>
									No data available
								</td>
							</tr>
						) : (
							rows.map((row, index) => (
								<React.Fragment key={row._id}>
									<tr
										className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
										onClick={() => toggleRow(index)}
									>
										<td className="px-6 py-4">{formatDate(row.date)}</td>
										<th
											scope="row"
											className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
										>
											{row.members.find(
												(member) => member.userId === row.paidBy
											)?.userName || "Unknown"}
										</th>
										<td className="px-6 py-4">{row.description}</td>
										<td className="px-6 py-4">&#8377;{row.amount}</td>
										<td className="px-6 py-4">
											{(() => {
												const currentUserMember = row.members.find(
													(member) => member.userId === currentUser?.id
												);

												if (currentUserMember?.paidStatus) {
													return (
														<div className="flex items-center h-5">
															<svg
																className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 flex-shrink-0"
																aria-hidden="true"
																xmlns="http://www.w3.org/2000/svg"
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
															</svg>
															Paid
														</div>
													);
												} else if (
													currentUserMember &&
													!currentUserMember.paidStatus
												) {
													return (
														<div className="flex items-center h-5">
															<input
																id={`remember_${index}`}
																type="checkbox"
																checked={checkboxStates[row._id]}
																onChange={() => {
																	setCheckboxStates((prev) => ({
																		...prev,
																		[row._id]: !prev[row._id],
																	}));
																	handleCheckboxChange(row);
																}}
																className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
																readOnly
															/>
														</div>
													);
												} else {
													return null;
												}
											})()}
										</td>
										<td className="px-6 py-4">
											{row.paidBy === currentUser?.id &&
												row.members.filter(
													(member) => member.paidStatus === true
												).length === 1 && (
													<button
														className="text-blue-600 hover:underline"
														onClick={() => handleDeleteClick(row._id)}
													>
														{/* Delete */}
														<Image
															src={"/deleteEntry.png"}
															alt={"Delete"}
															width={30}
															height={30}
														/>
													</button>
												)}
										</td>
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
																		<path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1-1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
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
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default GlobalTable;
