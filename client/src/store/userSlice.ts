import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrentUser } from "../types/types";

const initialState: CurrentUser = {
	userId: "",
	userName: "",
	email: "",
	roomId: "",
	roomName: "",
};

const currentUserSlice = createSlice({
	name: "currentUser",
	initialState,
	reducers: {
		setCurrentUser(_state, action: PayloadAction<CurrentUser>) {
			return action.payload;
		},
	},
});

export const { setCurrentUser } = currentUserSlice.actions;
export default currentUserSlice.reducer;
