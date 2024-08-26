import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./components/SignIn/SignIn.tsx";
import Home from "./components/Home/Home.tsx";
import SignUp from "./components/SignUp/SignUp.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { ProtectedRoutes, PublicRoute } from "./utils/ProtectedRoutes.tsx";
import NewEntry from "./components/NewEntry/NewEntry.tsx";
import MyEntries from "./components/Tables/MyEntries/MyEntries.tsx";
import RoomEntries from "./components/Tables/RoomEntries/RoomEntries.tsx";
import Ledger from "./components/Tables/Ledger/Ledger.tsx";
import { Provider } from "react-redux";
import store from "./store/store.ts";
import PaymentConfirmation from "./components/Tables/PaymentConfirmation/PaymentConfirmation.tsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <ProtectedRoutes />,
		children: [
			{
				path: "/",
				element: <Home />,
				children: [
					{ index: true, element: <RoomEntries /> },
					{ path: "my-entries", element: <MyEntries /> },
					{ path: "room-entries", element: <RoomEntries /> },
					{ path: "ledger", element: <Ledger /> },
					{ path: "payment-confirmation", element: <PaymentConfirmation /> },
				],
			},
		],
	},
	{
		path: "/new-entry",
		element: <ProtectedRoutes />,
		children: [{ path: "", element: <NewEntry /> }],
	},
	{
		path: "/sign-in",
		element: <PublicRoute />,
		children: [{ path: "", element: <SignIn /> }],
	},
	{
		path: "/sign-up",
		element: <PublicRoute />,
		children: [{ path: "", element: <SignUp /> }],
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<ThemeProvider
				defaultTheme="dark"
				storageKey="vite-ui-theme"
				children={undefined}
			/>
			<RouterProvider router={router} />
			<Toaster />
		</Provider>
	</React.StrictMode>
);
