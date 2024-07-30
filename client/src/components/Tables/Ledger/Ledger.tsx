import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { EntryType, LedgerType } from "../../../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Skeleton } from "../../ui/skeleton";
import { Circle, CircleCheck, Info } from "lucide-react";
import { formatDate } from "../../../lib/utils";
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
import { getAssociatedEntriesAction, getLedger } from "../../../api/ledger";
interface Member {
	paidStatus: boolean;
	userId: string;
	userName: string;
	_id: string;
}
const Ledger = () => {
	const pageLimit: number = 10;
	const [ledgers, setLedgers] = useState<LedgerType[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(0);

	const [rows, setRows] = useState<EntryType[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [show, setShow] = useState<boolean>(false);
	const [name, setName] = useState("Name");
	const [cookies] = useCookies();
	const token = cookies.token;
	const currentUser = useSelector((state: RootState) => state.currentUser);
	const [memberId, setMemberId] = useState<null | string>(null);

	async function fetchLedgerEntries() {
		setLoading(true);
		try {
			const response = await getLedger(token);
			// console.log(response);

			const filteredLedgers = response.data.map((ledger: LedgerType) => ({
				...ledger,
				members: ledger.members.filter(
					(member) => member.userId !== currentUser.userId
				),
			}));

			setLedgers(filteredLedgers);
		} catch (error) {
			console.error("Failed to fetch entries:", error);
		} finally {
			setLoading(false);
		}
	}
	useEffect(() => {
		fetchLedgerEntries();
	}, []);

	const fetchAssociatedEntries = async (page: number, memberId: string) => {
		setLoading(true);
		setShow(false);
		try {
			const result = await getAssociatedEntriesAction(
				page,
				pageLimit,
				token,
				memberId
			);
			console.log("Ledger Associated ", result, show);
			if (result.data) {
				const member = result.data[0].members.find(
					(member: Member) => member.userId === memberId
				);
				// console.log(member);

				setName(member?.userName || "Name");
				setShow(true);
				setRows(result.data);
				setCurrentPage(page);
				setTotalPages(result.pagination.totalPages);
			}
		} catch (error) {
			console.error("Error fetching My Entries", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePaginationClick = (page: number) => {
		if (memberId) {
			fetchAssociatedEntries(page, memberId);
		}
	};

	function viewEntries(userId: string) {
		setMemberId(userId);
		fetchAssociatedEntries(1, userId);
	}

	if (loading) {
		return (
			<div className="relative w-full overflow-auto">
				<h2 className="mb-2">Ledger</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto min-w-max">
						<thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
							<tr className="border-b">
								{["Name", "Payable", "Receivable", "Total"].map(
									(_header, index) => (
										<th key={index} scope="col" className="px-6 py-3 text-left">
											<Skeleton className="h-4 w-full" />
										</th>
									)
								)}
							</tr>
						</thead>

						<tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
							{Array.from({ length: 5 }).map((_, rowIndex) => (
								<tr
									key={rowIndex}
									className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									{Array.from({ length: 4 }).map((_, colIndex) => (
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
								{Array.from({ length: 3 }).map((_, colIndex) => (
									<td key={colIndex} className="px-6 py-3">
										<Skeleton className="h-4 w-full" />
									</td>
								))}
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		);
	}
	return (
		<div>
			<div className="relative w-full overflow-auto">
				<h2 className="mb-2">Ledger</h2>
				<div className="overflow-x-auto">
					<table className="w-full table-auto min-w-max">
						<thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
							<tr className="border-b">
								<th scope="col" className="px-6 py-3 text-left">
									Name
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Payable
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Receivable
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									Total
								</th>
								<th scope="col" className="px-6 py-3 text-left">
									View
								</th>
							</tr>
						</thead>
						<tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
							{ledgers.length === 0 ? (
								<tr className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
									<td colSpan={7} className="px-6 py-4 text-center">
										No data available
									</td>
								</tr>
							) : (
								ledgers.flatMap((ledger) =>
									ledger.members.map((member) => (
										<tr
											key={member._id}
											className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
										>
											<td className="px-6 py-4">{member.userName}</td>
											<td className="px-6 py-4">&#8377;{member.payable}</td>
											<td className="px-6 py-4">&#8377;{member.receivable}</td>
											<td
												className={`px-6 py-4 ${
													member.receivable - member.payable >=	 0
														? "text-green-500"
														: "text-red-500"
												}`}
											>
												&#8377;{member.receivable - member.payable}
											</td>
											<td className="px-6 py-4">
												{Math.ceil(member.payable - member.receivable) != 0 ? (
													<Info
														className="cursor-pointer"
														onClick={() => viewEntries(member.userId)}
													/>
												) : null}
											</td>
										</tr>
									))
								)
							)}
						</tbody>

						<tfoot className="bg-gray-200 dark:bg-gray-800">
							<tr>
								<th scope="row" className="px-6 py-3 text-base text-left">
									Total
								</th>
								<td className="px-6 py-3">
									{(() => {
										const totalPayable = ledgers.reduce(
											(sum, ledger) =>
												sum +
												ledger.members.reduce(
													(memSum, member) => memSum + member.payable,
													0
												),
											0
										);
										const colorClass = "text-red-500";
										// totalPayable < 0 ? : "text-green-500";
										return (
											<span className={colorClass}>&#8377;{totalPayable}</span>
										);
									})()}
								</td>
								<td className="px-6 py-3">
									{(() => {
										const totalReceivable = ledgers.reduce(
											(sum, ledger) =>
												sum +
												ledger.members.reduce(
													(memSum, member) => memSum + member.receivable,
													0
												),
											0
										);
										const colorClass = "text-green-500";
										// totalReceivable < 0 ? "text-red-500" : "text-green-500";
										return (
											<span className={colorClass}>
												&#8377;{totalReceivable}
											</span>
										);
									})()}
								</td>
								<td className="px-6 py-3">
									{(() => {
										const totalDifference = ledgers.reduce(
											(sum, ledger) =>
												sum +
												ledger.members.reduce(
													(memSum, member) =>
														memSum + (member.receivable - member.payable),
													0
												),
											0
										);
										const colorClass =
											totalDifference < 0 ? "text-red-500" : "text-green-500";
										return (
											<span className={colorClass}>
												&#8377;{totalDifference}
											</span>
										);
									})()}
								</td>
								<td></td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
			{show && (
				<div className="relative w-full overflow-auto mt-10">
					<h2 className="mb-2">{name}</h2>
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
											</td>{" "}
											<td className="px-6 py-4">
												{row.members.find(
													(member) => member.userId === row.paidBy
												)?.userName || "Unknown"}
											</td>
											<td className="px-6 py-4">{row.description}</td>
											<td
												className={`px-6 py-4 ${
													row.paidBy === currentUser?.userId
														? "text-green-500"
														: "text-red-500"
												}`}
											>
												&#8377;{row.amount}
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
									<td scope="row" className="px-6 py-3 text-base text-left">
										Total
									</td>
									<td className="px-6 py-3"></td>
									<td className="px-6 py-3"></td>
									<td className="px-6 py-3">
										&#8377;{rows.reduce((sum, row) => sum + row.amount, 0)}
									</td>
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
											if (currentPage > 1)
												handlePaginationClick(currentPage - 1);
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
			)}
		</div>
	);
};

export default Ledger;
