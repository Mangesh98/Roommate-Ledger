// src/api/index.ts

import { EntryFormData, UpdateEntry } from "../types/types";

export const getEntryAction = async (
	page: number,
	limit: number,
	token: string
) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/entry/get-all-entry`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, page, limit }),
		});

		if (response.ok) {
			const result = await response.json();
			return {
				success: true,
				data: result.entries,
				user: result.user,
				pagination: result.pagination,
			};
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during fetching entries:", error);
		return {
			error: "An unexpected error occurred. Please try again later.",
		};
	}
};

export const getMyEntryAction = async (
	page: number,
	limit: number,
	token: string
) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/entry/get-my-entry`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, page, limit }),
		});

		if (response.status === 401) {
			window.location.href = "/sign-in";
		}

		if (response.ok) {
			const result = await response.json();
			return {
				success: true,
				data: result.entries,
				pagination: result.pagination,
			};
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during fetching my entries:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};

export const deleteEntryAction = async (entryId: string, token: string) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/entry/delete-entry`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: token, entryId: entryId }),
		});

		if (response.ok) {
			const result = await response.json();
			// console.log(result.entry);

			return { success: true, message: result.message };
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};

export const updateEntryAction = async (data: UpdateEntry, token: string) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/entry/update-entry`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: token, data: data }),
		});

		if (response.ok) {
			const result = await response.json();
			return { success: true, message: result.message };
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};

export const createEntryAction = async (data: EntryFormData, token: string) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/entry/new-entry`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}
		// console.log(data);

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

