"use client";
import React, { useEffect, useState } from "react";
import { getLedger } from "@/app/lib/ledgerAction";

interface Member {
	userId: string;
	userName: string;
	payable: number;
	receivable: number;
	_id: string;
}
interface CurrentUser {
	id: string;
	name: string;
	roomId: string;
}
interface Ledger {
	_id: string;
	room: string;
	userId: string;
	__v: number;
	members: Member[];
	updatedAt: string;
}

const Ledger = () => {
	const [ledgers, setLedgers] = useState<Ledger[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [currentUser, setCurrentUser] = useState<CurrentUser[]>([]);
	async function fetchLedgerEntries() {
		try {
			const response = await getLedger();
			// console.log("Without filter",response.data);
			setCurrentUser(response.user);

			// Remove the current user's record from the members array
			const filteredLedgers = response.data.map((ledger: Ledger) => ({
				...ledger,
				members: ledger.members.filter(
					(member) => member.userId !== response.user.id
				),
			}));
			// console.log("with filter", filteredLedgers);

			setLedgers(filteredLedgers);
		} catch (error) {
			console.error("Failed to fetch entries:", error);
		}
	}
	useEffect(() => {
		fetchLedgerEntries();
		setLoading(false);
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
				<h2 className="mb-2">Ledger</h2>
				<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
					<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
						<tr>
							<th scope="col" className="px-6 py-3">
								Name
							</th>
							<th scope="col" className="px-6 py-3">
								Payable
							</th>
							<th scope="col" className="px-6 py-3">
								Receivable
							</th>
							<th scope="col" className="px-6 py-3">
								Total
							</th>
						</tr>
					</thead>
					<tbody>
						{ledgers.flatMap((ledger) =>
							ledger.members.map((member) => (
								<tr
									key={member._id}
									className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 "
								>
									<td className="px-6 py-4">{member.userName}</td>
									<td className="px-6 py-4">&#8377;{member.payable}</td>
									<td className="px-6 py-4">&#8377;{member.receivable}</td>
									<td className="px-6 py-4">
										&#8377;{member.receivable - member.payable}
									</td>
								</tr>
							))
						)}
					</tbody>
					<tfoot>
						<tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700">
							<th scope="row" className="px-6 py-3 text-base">
								Total
							</th>
							<td className="px-6 py-3">
								&#8377;
								{ledgers.reduce(
									(sum, ledger) =>
										sum +
										ledger.members.reduce(
											(memSum, member) => memSum + member.payable,
											0
										),
									0
								)}
							</td>
							<td className="px-6 py-3">
								&#8377;
								{ledgers.reduce(
									(sum, ledger) =>
										sum +
										ledger.members.reduce(
											(memSum, member) => memSum + member.receivable,
											0
										),
									0
								)}
							</td>
							<td className="px-6 py-3">
								&#8377;
								{ledgers.reduce(
									(sum, ledger) =>
										sum +
										ledger.members.reduce(
											(memSum, member) =>
												memSum + (member.receivable - member.payable),
											0
										),
									0
								)}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};

export default Ledger;
