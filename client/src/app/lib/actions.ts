"use server";

import { cookies } from "next/headers";
import { LoginFormValues } from "../(auth)/login/page";
import { SignUpFormValues } from "../(auth)/signup/page";

export const loginAction = async (formData: LoginFormValues) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/login`;
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
			return { error: errorData.message || "Login failed" }; // Include error message
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};
export const signUpAction = async (formData: SignUpFormValues) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/register`;

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
export const createRoomAction = async (roomName: String) => {
	try {
		const url = `${process.env.NEXT_PUBLIC_DB_HOST}/create-room`;
		
		let token=cookies().get("token")?.value;
		if(!token){
			return { success: false, error: "Unauthorized Access !" };
		}
		
		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ "roomName": roomName,"token":token }),
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
