export const getRoomDetailsAction = async (token: string) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/room/get-room-details`;

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
			return {
				success: true,
				members: result.members,
				categories: result.categories,
			};
		} else {
			return { success: false, error: "Failed to create room" };
		}
	} catch (error) {
		console.error("Error during login:", error);
		return { error: "An unexpected error occurred. Please try again later." }; // Generic error for client
	}
};
