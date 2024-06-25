"use server";
import { cookies } from "next/headers";
import { EntryFormData } from "../new-entry/page";


export const createEntryAction = async (data: EntryFormData) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/new-entry`;

		let token = cookies().get("token")?.value;
		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ data: data, token: token }),
		});

		if (response.ok) {
			const result = await response.json();
			return { success: true, message: result.message };
		} else {
			return { success: false, error: "Failed to create Entry" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};

export const getEntryAction = async () => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/get-all-entry`;

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

			return { success: true, data: result.entries, user: result.user };
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};

export const getMyEntryAction = async () => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/get-my-entry`;

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
			return { success: true, data: result.entries };
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};
