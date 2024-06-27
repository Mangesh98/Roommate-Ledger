"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LoginFormValues } from "../(auth)/sign-in/page";
import { SignUpFormValues } from "../(auth)/sign-up/page";

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
			return { error: null };
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
	redirect("/sign-in");
};