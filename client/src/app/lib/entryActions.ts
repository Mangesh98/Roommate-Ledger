"use server";
import { cookies } from "next/headers";
import { EntryFormData } from "../new-entry/page";
import { UpdateEntry } from "../components/Table/GlobalTable";
import { redirect } from "next/navigation";
// import { UpdateEntryById } from "../update-entry/[id]/page";

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

export const getEntryAction = async (page: Number, limit: Number) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/get-all-entry`;

		let token = cookies().get("token")?.value;
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
		console.error("Error during login:", error);
		return {
			error: "An unexpected error occurred. Please try again later.",
		};
	}
};

export const getMyEntryAction = async () => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/get-my-entry`;

		let token = cookies().get("token")?.value;
		if (!token) {
			redirect("/sign-in");
			// return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token: token }),
		});
		if (response.status == 401) {
			redirect("/sign-in");
		}
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
export const updateEntryAction = async (data: UpdateEntry) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/update-entry`;

		let token = cookies().get("token")?.value;
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

export const deleteEntryAction = async (entryId: string) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/entry/delete-entry`;

		let token = cookies().get("token")?.value;
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
