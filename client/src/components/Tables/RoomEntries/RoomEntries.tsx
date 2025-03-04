import { useCookies } from "react-cookie";
import { useEffect, useMemo, useState } from "react";
import {
	deleteEntryAction,
	getEntryAction,
	paymentRequestAction,
} from "../../../api/entry";
import { CurrentUser, EntryType } from "../../../types/types";
import { useToast } from "../../ui/use-toast";
import {
	CalendarIcon,
	ChevronDown,
	Circle,
	CircleCheck,
	CircleDashed,
	HandCoins,
	Info,
	Trash2,
} from "lucide-react";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

import { Button } from "../../ui/button";
import { cn, formatDate } from "../../../lib/utils";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setCurrentUser } from "../../../store/userSlice";
import { Skeleton } from "../../ui/skeleton";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../../ui/calendar";

const RoomEntries = () => {
	const [rows, setRows] = useState<EntryType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [, setCheckboxStates] = useState<{ [key: string]: boolean }>({});
	const [, setOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [totalEntries, setTotalEntries] = useState<number>(1);
	const [cookies] = useCookies();
	const token = cookies.token;
	const { toast } = useToast();
	const [pageLimit, setPageLimit] = useState<string>("10");
	const dispatch = useDispatch<AppDispatch>();
	const currentUser = useSelector((state: RootState) => state.currentUser);
	const [date, setDate] = useState<DateRange | undefined>(undefined);

	const fetchEntries = async (page: number, filter?: boolean) => {
		setLoading(true);
		try {
			let response;
			if (filter) {
				setDate(undefined);
				response = await getEntryAction(page, parseInt(pageLimit), token);
			} else {
				response = await getEntryAction(
					page,
					parseInt(pageLimit),
					token,
					date?.from,
					date?.to
				);
			}

			if (response.error) {
				toast({
					variant: "destructive",
					title: "Failed to fetch entries",
					description: "Something went wrong",
				});
			} else {
				setRows(response.data);
				const userData: CurrentUser = response.user;
				dispatch(setCurrentUser(userData));
				setTotalPages(response.pagination.totalPages);
				setTotalEntries(response.pagination.totalEntries);
				setCurrentPage(page);
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
		const updateEntryStatus = await paymentRequestAction(data._id, token);
		if (updateEntryStatus.success) {
			toast({
				title: "Request sent successfully",
				description: "Paid request sent to the Entry Owner Successfully",
				variant: "default",
			});
			await fetchEntries(currentPage);
		} else {
			toast({
				title: "Failed to sent request",
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
		fetchEntries(currentPage);
	}, [pageLimit]);

	const generateOptions = useMemo((): string[] => {
		const standardOptions = [10, 25, 50, 100];
		const options: number[] = standardOptions.filter(
			(option) => option <= totalEntries
		);

		// Add totalEntries as an option if it's not already included
		if (!options.includes(totalEntries) && totalEntries > 0) {
			options.push(totalEntries);
		}

		// Sort options and convert to strings
		return options.sort((a, b) => a - b).map(String);
	}, [totalEntries]);

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

	const getPaginationPages = (currentPage :number, totalPages:number) => {
	let startPage = Math.max(currentPage - 1, 1);
	let endPage = Math.min(currentPage + 2, totalPages);
  
	if (currentPage === 1) {
	  endPage = Math.min(4, totalPages);
	}
	if (currentPage === totalPages) {
	  startPage = Math.max(totalPages - 3, 1);
	}
  
	const pages = [];
	for (let i = startPage; i <= endPage; i++) {
	  pages.push(i);
	}
	return pages;
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
				{/* Set Entries size */}
				<div className="filters mb-4">
					<div className="flex gap-4 items-center my-4">
						{/* Page Size Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="flex items-center">
									{pageLimit} <ChevronDown className="ml-2" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-full">
								<DropdownMenuLabel>Entries per page</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuRadioGroup
									value={pageLimit}
									onValueChange={setPageLimit}
								>
									{generateOptions.map((option) => (
										<DropdownMenuRadioItem key={option} value={option}>
											{option}
										</DropdownMenuRadioItem>
									))}
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Date Range Picker */}
						<Popover>
							<PopoverTrigger asChild>
								<Button
									id="date"
									variant="outline"
									className={cn(
										"w-[300px] justify-start text-left font-normal",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{date?.from ? (
										date.to ? (
											<>
												{format(date.from, "LLL dd, y")} -{" "}
												{format(date.to, "LLL dd, y")}
											</>
										) : (
											format(date.from, "LLL dd, y")
										)
									) : (
										<span>Pick a date range</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={date?.from}
									selected={date}
									onSelect={setDate}
									numberOfMonths={2}
									disabled={(date) =>
										date > new Date() || date < new Date("1900-01-01")
									}
								/>
							</PopoverContent>
						</Popover>
						{/* Filter Button */}
						<Button
							disabled={date == undefined}
							variant="secondary"
							onClick={() => fetchEntries(1)}
						>
							Apply
						</Button>
						<Button
							disabled={date == undefined}
							variant="destructive"
							onClick={() => fetchEntries(1, true)}
						>
							Reset
						</Button>
					</div>

					{/* Get Entries */}
					<div className="flex space-x-4">
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
													if (currentUserMember?.isPending) {
														return (
															<div className="flex items-center">
																<CircleDashed className="w-3.5 h-3.5 me-1 text-red-500 dark:text-red-500 flex-shrink-0" />
																<span>Pending</span>
															</div>
														);
													} else if (currentUserMember?.paidStatus) {
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
																		<AlertDialogCancel>
																			Cancel
																		</AlertDialogCancel>
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
																		This action cannot be undone. This will
																		delete the record from the server.
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
																Total Amount : &#8377; {row.amount}
															</label>
															<label className="mt-1 block">
																Created At :
																<span
																	style={{ marginLeft: "8px" }}
																>{`${new Date(row.createdAt)
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
				</div>
				
				<div className="w-full flex justify-center mt-4">
  <Pagination>
    <PaginationContent className="flex items-center space-x-2">
      {/* Previous Button */}
      <PaginationItem>
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage > 1) handlePaginationClick(currentPage - 1);
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>

      {/* Optionally display first page and ellipsis if needed */}
      {getPaginationPages(currentPage, totalPages)[0] > 1 && (
        <>
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePaginationClick(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
          {getPaginationPages(currentPage, totalPages)[0] > 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
        </>
      )}

      {/* Display the window of pages */}
      {getPaginationPages(currentPage, totalPages).map((page) => (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePaginationClick(page);
            }}
            isActive={currentPage === page}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}

      {/* Optionally display ellipsis and last page if needed */}
      {getPaginationPages(currentPage, totalPages).slice(-1)[0] < totalPages && (
        <>
          {getPaginationPages(currentPage, totalPages).slice(-1)[0] < totalPages - 1 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePaginationClick(totalPages);
              }}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        </>
      )}

      {/* Next Button */}
      <PaginationItem>
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (currentPage < totalPages) handlePaginationClick(currentPage + 1);
          }}
          className={
            currentPage === totalPages ? "pointer-events-none opacity-50" : ""
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
