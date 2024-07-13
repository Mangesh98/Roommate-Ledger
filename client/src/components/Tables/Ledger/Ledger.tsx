import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { getLedger } from "../../../api/entry";
import { LedgerType } from "../../../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

const Ledger = () => {
	const [ledgers, setLedgers] = useState<LedgerType[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [cookies] = useCookies();
	const token = cookies.token;
	const currentUser = useSelector((state: RootState) => state.currentUser);

	async function fetchLedgerEntries() {
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
											<td className="px-6 py-4">
												&#8377;{member.receivable - member.payable}
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
		</div>
	);
};

export default Ledger;
