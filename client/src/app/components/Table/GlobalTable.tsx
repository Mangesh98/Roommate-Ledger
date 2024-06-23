import React from "react";

const GlobalTable = () => {
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
								Description
							</th>
							<th scope="col" className="px-6 py-3">
								Price
							</th>
						</tr>
					</thead>
					<tbody>
						<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<td className="px-6 py-4">{date}</td>
							<th
								scope="row"
								className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
							>
								Mangesh
							</th>
							<td className="px-6 py-4">Chicken</td>
							<td className="px-6 py-4">&#8377;400</td>
						</tr>
						<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<td className="px-6 py-4">{date}</td>
							<th
								scope="row"
								className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
							>
								kishor
							</th>
							<td className="px-6 py-4">Vegetable&apos;s</td>
							<td className="px-6 py-4">&#8377;100</td>
						</tr>
						<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<td className="px-6 py-4">{date}</td>
							<th
								scope="row"
								className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
							>
								Abhay
							</th>
							<td className="px-6 py-4">Vegetable&apos;s</td>
							<td className="px-6 py-4">&#8377;100</td>
						</tr>
						<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
							<td className="px-6 py-4">{date}</td>
							<th
								scope="row"
								className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
							>
								Rushikesh
							</th>
							<td className="px-6 py-4">Vegetable&apos;s</td>
							<td className="px-6 py-4">&#8377;100</td>
						</tr>
					</tbody>
					<tfoot>
						<tr className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 ">
							<th scope="row" className="px-6 py-3 text-base">
								Total
							</th>
							<td className="px-6 py-3"></td>
							<td className="px-6 py-3"></td>
							<td className="px-6 py-3">&#8377;700</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	);
};

export default GlobalTable;
