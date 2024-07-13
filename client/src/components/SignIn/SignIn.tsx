import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useCookies } from "react-cookie";
import { SignInSchema } from "../../schemas/signInSchema";

const SignIn = () => {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [, setCookie] = useCookies(["token"]);

	const form = useForm<z.infer<typeof SignInSchema>>({
		resolver: zodResolver(SignInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const onSubmit = async (data: z.infer<typeof SignInSchema>) => {
		setIsSubmitting(true);
		try {
			const url = `${import.meta.env.VITE_HOST_URL}/users/login`;
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const result = await response.json();
			if (result.success) {
				toast({
					variant: "default",
					title: "Login Successful !",
					description: "You have successfully logged in",
				});
				// const data: CurrentUser = result.userData;
				// dispatch(setCurrentUser(data));

				setCookie("token", result.token, { path: "/" }); // It will automatically redirect to '/'
			} else {
				toast({
					variant: "destructive",
					title: result.message,
					description: "Please fill valid details !",
				});
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<>
			<section className="">
				<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
					<div className="w-full rounded-lg shadow md:border md:mt-0 sm:max-w-lg xl:p-0 ">
						<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
								Welcome back to Roommate Ledger
							</h1>
							<p className="mb-4">Sign In to start your roommate ledger</p>
						</div>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4 md:space-y-6 p-6"
							>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="email123@email.com"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input
													placeholder="Password"
													type="password"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
											wait
										</>
									) : (
										"Sign In"
									)}
								</Button>
							</form>
						</Form>
						<div className="text-center mt-4 mb-4">
							<p>
								<span>Don't have an account?</span>
								<Link
									to="/sign-up"
									className="text-blue-600 hover:text-blue-800 ml-2"
								>
									Sign Up
								</Link>
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};
export default SignIn;

{
	/* <FormField
	control={form.control}
	name="date"
	render={({ field }) => (
		<FormItem>
			<FormLabel>Date</FormLabel>
			<FormControl>
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"outline"}
							className={cn(
								"w-[280px] justify-start text-left font-normal",
								!date && "text-muted-foreground"
							)}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{date ? format(date, "PPP") : <span>Pick a date</span>}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							onSelect={setDate}
							initialFocus
							{...field}
						/>
					</PopoverContent>
				</Popover>
			</FormControl>
			<FormMessage />
		</FormItem>
	)}
/>; */
}
