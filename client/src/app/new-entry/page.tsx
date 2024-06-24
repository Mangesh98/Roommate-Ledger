"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getRoomDetailsAction } from "../lib/actions";

const NewEntry = () => {
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState<number | undefined>(undefined);
	const [date, setDate] = useState<string>(getCurrentDate());
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
	const [roomMembers, setRoomMembers] = useState<any[]>([]);

	useEffect(() => {
		async function fetchMembers() {
			try {
				const roomDetails = await getRoomDetailsAction();
				setRoomMembers(roomDetails.members);
				console.log(roomMembers);
			} catch (error) {
				console.error("Failed to fetch members:", error);
			}
		}

		fetchMembers();
	}, []);

	// Function to get today's date in YYYY-MM-DD format
	function getCurrentDate() {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
		const day = String(today.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	const handleMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const memberId = event.target.value;

		if (event.target.checked) {
			setSelectedMembers([...selectedMembers, memberId]);
		} else {
			setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
		}
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// Handle form submission logic here
		console.log("Form submitted");
		console.log("Selected members:", selectedMembers);
	};

	return (
		<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
			<Link
				href="/"
				type="button"
				className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 inline-block"
			>
				&larr; Go Back
			</Link>

			<form onSubmit={handleSubmit} className="max-w-sm mx-auto">
				<div className="mb-5">
					<label
						htmlFor="description"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Description
					</label>
					<textarea
						id="description"
						rows={4}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Write your description..."
					></textarea>
				</div>
				<div className="mb-5">
					<label
						htmlFor="price"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Price
					</label>
					<input
						type="number"
						id="price"
						name="price"
						value={price || ""}
						onChange={(e) => setPrice(Number(e.target.value))}
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						required
						placeholder="₹10"
					/>
				</div>
				<div className="mb-5">
					<label
						htmlFor="date"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Date
					</label>
					<input
						type="date"
						id="date"
						name="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						max={getCurrentDate()}
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						required
					/>
				</div>

				<div className="members mb-4">
					<h3 className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
						Choose Members:
					</h3>
					<ul className="grid w-full gap-6 md:grid-cols-3">
						{roomMembers.map((member) => (
							<li key={member.userId}>
								<input
									type="checkbox"
									id={member.userId}
									value={member.userId}
									className="hidden peer"
									checked={selectedMembers.includes(member.userId)}
									onChange={handleMemberChange}
								/>
								<label
									htmlFor={member.userId}
									className="inline-flex items-center justify-between w-full p-5 text-gray-500 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600 hover:text-gray-600 dark:peer-checked:text-gray-300 peer-checked:text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700"
								>
									<div className="block">
										<div className="w-full text-sm font-semibold">
											{member.userName}
										</div>
									</div>
								</label>
							</li>
						))}
					</ul>
				</div>
				<button
					type="submit"
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default NewEntry;


