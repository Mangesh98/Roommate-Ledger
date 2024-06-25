"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginFormValues } from "../(auth)/login/page";
import { SignUpFormValues } from "../(auth)/signup/page";
import { EntryFormData } from "../new-entry/page";

export const loginAction = async (formData: LoginFormValues) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/users/login`;
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		});
		if (response.ok) {
			const data = await response.json();
			cookies().set("token", data.token);
			console.log("Login successful!");
			return { error: null }; // Indicate success
		} else {
			const errorData = await response.json();
			console.log(errorData);

			return { error: errorData.message || "Login failed" }; // Include error message
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};
export const signUpAction = async (formData: SignUpFormValues) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/users/register`;

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		});

		if (response.ok) {
			const data = await response.json();
			cookies().set("token", data.token);
			console.log("Registration successful!");
			return { error: null }; // Indicate success
		} else {
			const errorData = await response.json();
			return { error: errorData.message || "Login failed" }; // Include error message
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};
export const logoutAction = async () => {
	cookies().set("token", "");
	console.log("Login successful!");
	redirect("/login");
};

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
export const getLedger = async () => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/ledger/get-ledger`;

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

			return { success: true, data: result.ledger, user: result.user };
		} else {
			return { success: false, error: "Failed to get Entries" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};
