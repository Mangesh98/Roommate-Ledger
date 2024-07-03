import { useState, useEffect } from "react";

export function useCurrentDate() {
	const [currentDate, setCurrentDate] = useState("");

	useEffect(() => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");
		setCurrentDate(`${year}-${month}-${day}`);
	}, []);

	return currentDate;
}
