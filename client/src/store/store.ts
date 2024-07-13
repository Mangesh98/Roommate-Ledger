import { configureStore } from "@reduxjs/toolkit";
import currentUserSlice  from "./userSlice";

const store = configureStore({
	reducer: {
		currentUser: currentUserSlice,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
