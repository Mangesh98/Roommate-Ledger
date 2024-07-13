import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import {
	deleteEntryAction,
	getEntryAction,
	updateEntryAction,
} from "../../../api/entry";
import { CurrentUser, EntryType, UpdateEntry } from "../../../types/types";
import { useToast } from "../../ui/use-toast";
import { Circle, CircleCheck, HandCoins, Info, Trash2 } from "lucide-react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../../ui/alert-dialog";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../../ui/pagination";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";

import { Button } from "../../ui/button";
import { formatDate } from "../../../lib/utils";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setCurrentUser } from "../../../store/userSlice";
import { Skeleton } from "../../ui/skeleton";

const RoomEntries = () => {
	const pageLimit: number = 10;
	const [rows, setRows] = useState<EntryType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [, setCheckboxStates] = useState<{ [key: string]: boolean }>({});
	const [, setOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [cookies] = useCookies();
	const token = cookies.token;
	const { toast } = useToast();

	const dispatch = useDispatch<AppDispatch>();
	const currentUser = useSelector((state: RootState) => state.currentUser);

	const fetchEntries = async (page: number) => {
		setLoading(true);
		try {
			const response = await getEntryAction(page, pageLimit, token);
			// console.log(response);

			if (response.error) {
				toast({
					variant: "destructive",
					title: "Failed to fetch entries",
					description: response.error,
				});
			} else {
				setRows(response.data);
				const userData: CurrentUser = response.user;
				dispatch(setCurrentUser(userData));
				setCurrentPage(page);
				setTotalPages(response.pagination.totalPages);
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Failed to fetch entries",
				description: error as string,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateEntry = async (data: EntryType) => {
		const updateRecord: UpdateEntry = {
			entryId: data._id,
			paidBy: data.paidBy,
			amount: Math.round(data.amount / data.members.length),
		};
		const updateEntryStatus = await updateEntryAction(updateRecord, token);
		if (updateEntryStatus.success) {
			toast({
				title: "Entry updated successfully",
				description: "Entry is removed and Ledger is updated successfully",
				variant: "default",
			});
			await fetchEntries(currentPage);
		} else {
			toast({
				title: "Failed to update entry",
				description: "Something went wrong",
				variant: "destructive",
			});
		}
		setOpen(false);
	};

	const handleDeleteClick = async (id: string) => {
		try {
			const deleteResult = await deleteEntryAction(id, token);
			if (deleteResult.success) {
				const newRows = rows.filter((row) => row._id !== id);
				setRows(newRows);
				toast({
					title: "Entry Deleted successfully!",
					description: "Entry is removed and Ledger is updated successfully",
					variant: "default",
				});
			} else {
				toast({
					title: "Failed to delete entry",
					description: "Something went wrong",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Failed to delete entry",
				description: "Something went wrong",
				variant: "destructive",
			});
		}
	};

	useEffect(() => {
		fetchEntries(currentPage);
	}, []);

	useEffect(() => {
		const initialCheckboxStates = rows.reduce((acc, row) => {
			acc[row._id] = row.status;
			return acc;
		}, {} as { [key: string]: boolean });
		setCheckboxStates(initialCheckboxStates);
	}, [rows]);

	const handlePaginationClick = (page: number) => {
		fetchEntries(page);
	};

	if (loading) {
		return (
			<>
				<div className="relative w-full overflow-auto">
					<div className="inline-block mb-4">
						<Skeleton className="h-8 w-1/4 mb-2" />
						<Skeleton className="h-8 w-1/5" />
					</div>
					<Skeleton className="h-6 w-1/3 mb-4" />
					<div className="overflow-x-auto">
						<table className="w-full table-auto min-w-max">
							<thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
								<tr className="border-b">
									{[
										"Date",
										"Name",
										"मकसद",
										"Amount",
										"Status",
										"Delete",
										"Info",
									].map((_header, index) => (
										<th key={index} scope="col" className="px-6 py-3 text-left">
											<Skeleton className="h-4 w-full" />
										</th>
									))}
								</tr>
							</thead>

							<tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
								{Array.from({ length: 5 }).map((_, rowIndex) => (
									<tr
										key={rowIndex}
										className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										{Array.from({ length: 7 }).map((_, colIndex) => (
											<td key={colIndex} className="px-6 py-4">
												<Skeleton className="h-4 w-full" />
											</td>
										))}
									</tr>
								))}
							</tbody>

							<tfoot className="bg-gray-200 dark:bg-gray-800">
								<tr>
									<th scope="row" className="px-6 py-3 text-base text-left">
										<Skeleton className="h-4 w-full" />
									</th>
									{Array.from({ length: 6 }).map((_, colIndex) => (
										<td key={colIndex} className="px-6 py-3">
											<Skeleton className="h-4 w-full" />
										</td>
									))}
								</tr>
							</tfoot>
						</table>
					</div>
					{/* Pagination controls */}
					<div className="pagination mt-2 flex space-x-2">
						{Array.from({ length: 5 }).map((_, index) => (
							<Skeleton key={index} className="h-8 w-8" />
						))}
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="relative w-full overflow-auto">
				<div className="inline-block mb-4">
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
						Room Name: {currentUser?.roomName}
					</h1>
					<Link
						to="/new-entry"
						className="inline-block mt-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg px-5 py-2.5 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
					>
						Create New Entry
					</Link>
				</div>
				<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
					Room Entries
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto min-w-max">
						<thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
							<tr className="border-b">
								<th scope="col" className="px-6 py-3 text-left">
									Date
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Name
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									मकसद
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Amount
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Status
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Delete
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Info
								</th>
							</tr>
						</thead>

						<tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
							{rows.length === 0 ? (
								<tr className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
									<td colSpan={7} className="px-6 py-4 text-center">
										No data available
									</td>
								</tr>
							) : (
								rows.map((row) => (
									<tr
										key={row._id}
										className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											{formatDate(new Date(row.date))}
										</td>
										<td className="px-6 py-4">
											{row.members.find(
												(member) => member.userId === row.paidBy
											)?.userName || "Unknown"}
										</td>
										<td className="px-6 py-4">{row.description}</td>
										<td className="px-6 py-4">&#8377;{row.amount}</td>
										<td className="px-6 py-4">
											{(() => {
												const currentUserMember = row.members.find(
													(member) => member.userId === currentUser.userId
												);

												if (currentUserMember?.paidStatus) {
													return (
														<div className="flex items-center">
															<CircleCheck className="w-3.5 h-3.5 me-1 text-green-500 dark:text-green-400 flex-shrink-0" />
															<span>Paid</span>
														</div>
													);
												} else if (
													currentUserMember &&
													!currentUserMember.paidStatus
												) {
													return (
														<AlertDialog>
															<AlertDialogTrigger
																asChild
																className="p-2 text-left flex items-center max-w-10 cursor-pointer"
															>
																<div className="cursor-pointer hover:text-green-400">
																	<span className="text-sm">
																		Pay
																		<label className="ml-1">
																			&#8377;
																			{Math.round(
																				row.amount / row.members.length
																			)}
																		</label>
																	</span>
																	<HandCoins className="w-3.5 h-3.5 ml-1 flex-shrink-0" />
																</div>
															</AlertDialogTrigger>
															<AlertDialogContent>
																<AlertDialogHeader>
																	<AlertDialogTitle>
																		Are you absolutely sure?
																	</AlertDialogTitle>
																	<AlertDialogDescription>
																		This action cannot be undone. This will
																		update the record as paid and update the
																		ledger of all associated users.
																	</AlertDialogDescription>
																</AlertDialogHeader>
																<AlertDialogFooter>
																	<AlertDialogCancel>Cancel</AlertDialogCancel>
																	<AlertDialogAction
																		className="bg-green-500 text-black hover:bg-green-600"
																		onClick={() => handleUpdateEntry(row)}
																	>
																		Continue
																	</AlertDialogAction>
																</AlertDialogFooter>
															</AlertDialogContent>
														</AlertDialog>
													);
												} else {
													return null;
												}
											})()}
										</td>

										<td className="px-6 py-4">
											{row.paidBy === currentUser.userId &&
												row.members.filter(
													(member) => member.paidStatus === true
												).length === 1 && (
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button
																variant="ghost"
																className="p-2 text-left flex items-center"
															>
																<Trash2 className="block h-4 w-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>
																	Are you absolutely sure?
																</AlertDialogTitle>
																<AlertDialogDescription>
																	This action cannot be undone. This will delete
																	the record from the server.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																	onClick={() => handleDeleteClick(row._id)}
																>
																	Continue
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												)}
										</td>
										<td className="px-6 py-4">
											<Dialog aria-labelledby="dialog-title">
												<DialogTrigger asChild className="cursor-pointer">
													<Info />
												</DialogTrigger>
												<DialogContent aria-describedby={row.description}>
													<DialogHeader>
														<DialogTitle>Members</DialogTitle>
														<div id="dialog-description">
															<ul className="mt-2 max-w-md space-y-1 text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-2">
																{row.members.map((member, idx) => (
																	<li key={idx} className="flex items-center">
																		{member.paidStatus ? (
																			<CircleCheck className="w-3.5 h-3.5 me-1 text-green-500 dark:text-green-400 flex-shrink-0" />
																		) : (
																			<Circle className="w-3.5 h-3.5 me-2 flex-shrink-0" />
																		)}
																		<div>
																			<span>{member.userName}</span>
																			<span className="ml-2">
																				&#8377;
																				{Math.round(
																					row.amount / row.members.length
																				)}
																			</span>
																		</div>
																	</li>
																))}
															</ul>
														</div>
													</DialogHeader>
													<DialogDescription>
														<label className="mt-1 block">
															Created At :
															<span style={{ marginLeft: "8px" }}>{`${new Date(
																row.createdAt
															)
																.toLocaleDateString("en-GB")
																.replace(/\//g, "-")} ${new Date(
																row.createdAt
															).toLocaleTimeString()}`}</span>
														</label>
													</DialogDescription>
												</DialogContent>
											</Dialog>
										</td>
									</tr>
								))
							)}
						</tbody>

						<tfoot className="bg-gray-200 dark:bg-gray-800">
							<tr>
								<th scope="row" className="px-6 py-3 text-base text-left">
									Total
								</th>
								<td className="px-6 py-3"></td>
								<td className="px-6 py-3"></td>
								<td className="px-6 py-3">
									&#8377;{rows.reduce((sum, row) => sum + row.amount, 0)}
								</td>
								<td className="px-6 py-3"></td>
								<td className="px-6 py-3"></td>
								<td className="px-6 py-3"></td>
							</tr>
						</tfoot>
					</table>
				</div>

				{/* Pagination controls */}
				<div className="pagination mt-2">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (currentPage > 1) handlePaginationClick(currentPage - 1);
									}}
									className={
										currentPage === 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>
							{Array.from({ length: totalPages }, (_, i) => (
								<PaginationItem key={i}>
									<PaginationLink
										href="#"
										onClick={(e) => {
											e.preventDefault();
											handlePaginationClick(i + 1);
										}}
										isActive={currentPage === i + 1}
									>
										{i + 1}
									</PaginationLink>
								</PaginationItem>
							))}
							{totalPages > 5 && currentPage < totalPages - 2 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										if (currentPage < totalPages)
											handlePaginationClick(currentPage + 1);
									}}
									className={
										currentPage === totalPages
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			</div>
		</>
	);
};

export default RoomEntries;
