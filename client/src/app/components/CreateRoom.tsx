"use client";
import React, { useState, FormEvent } from "react";
import { createRoomAction } from "../lib/actions";

const CreateRoom: React.FC = () => {
	const [roomName, setRoomName] = useState<string>("");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();

		const result = await createRoomAction(roomName);

		if (result.success) {
			console.log("Room created successfully:", result.roomId);
		} else {
			console.error(result.error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-sm mx-auto">
			<div className="mb-5">
				<label
					htmlFor="roomName"
					className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
				>
					Room Name
				</label>
				<input
					type="text"
					id="roomName"
					value={roomName}
					onChange={(e) => setRoomName(e.target.value)}
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Homies"
					required
				/>
			</div>

			<button
				type="submit"
				className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			>
				Create Room
			</button>
		</form>
	);
};

export default CreateRoom;
