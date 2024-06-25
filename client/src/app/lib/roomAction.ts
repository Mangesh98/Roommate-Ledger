"use server";
import { cookies } from "next/headers";

export const createRoomAction = async (roomName: String) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/room/create-room`;

		let token = cookies().get("token")?.value;
		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ roomName: roomName, token: token }),
		});

		if (response.ok) {
			const result = await response.json();
			return { success: true, roomId: result.roomId };
		} else {
			return { success: false, error: "Failed to create room" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};

export const getRoomDetailsAction = async () => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/room/get-room-details`;

		let token = cookies().get("token")?.value;
		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: token }),
		});

		if (response.ok) {
			const result = await response.json();
			return { success: true, members: result.members };
		} else {
			return { success: false, error: "Failed to create room" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};
