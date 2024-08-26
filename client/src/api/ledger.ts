export const getLedger = async (token: string) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/ledger/get-ledger`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});

		if (response.ok) {
			const result = await response.json();
			return { success: true, data: result.ledger };
		} else {
			return { success: false, error: "Failed to get Ledger" };
		}
	} catch (error) {
		console.error("Error during fetching ledger:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};
export const getAssociatedEntriesAction = async (
	page: number,
	limit: number,
	token: string,
	memberId: string
) => {
	try {
		const url = `${import.meta.env.VITE_HOST_URL}/ledger/get-associated-entries`;

		if (!token) {
			return { success: false, error: "Unauthorized Access !" };
		}

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, page, limit, memberId }),
		});

		if (response.status === 401) {
			window.location.href = "/sign-in";
		}

		if (response.ok) {
			const result = await response.json();
			// console.log(result);
			
			return {
				success: true,
				data: result.entries,
				pagination: result.pagination,
			};
		} else {
			return { success: false, error: "Failed to get Associated Entries" };
		}
	} catch (error) {
		console.error("Error during fetching Associated entries:", error);
		return { error: "An unexpected error occurred. Please try again later." };
	}
};
