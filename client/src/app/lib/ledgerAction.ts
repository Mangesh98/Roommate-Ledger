"use server";
import { cookies } from "next/headers";

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
