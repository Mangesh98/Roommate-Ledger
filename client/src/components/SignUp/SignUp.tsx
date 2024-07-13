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
import { SignUpSchema } from "../../schemas/signUpSchema";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { useCookies } from "react-cookie";

const SignUp = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [, setCookie] = useCookies(["token"]);
	const form = useForm<z.infer<typeof SignUpSchema>>({
		resolver: zodResolver(SignUpSchema),
		defaultValues: {
			name: "",
			email: "",
			room: "",
			password: "",
		},
	});
	const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
		setIsSubmitting(true);
		try {
			const url = `${import.meta.env.VITE_HOST_URL}/users/register`;
			const response = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const result = await response.json();
			// console.log(result);
			if (result.success) {
				toast({
					variant: "default",
					title: "Account created successfully",
					description: "Please check your email to verify your account",
				});
				setCookie("token", result.token, { path: "/" });

				navigate("/");
			} else {
				toast({
					variant: "destructive",
					title: result.message,
					description: "Please fill correct details !",
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
			<section className="bg-gray-50 dark:bg-gray-900">
				<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
					<div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
						<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
							<h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
								Join Roommate Ledger
							</h1>
							<p className="mb-4">Sign up to start your roommate ledger</p>
						</div>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4 md:space-y-6 p-6"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
												First Name
											</FormLabel>
											<FormControl>
												<Input
													className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
													placeholder="First Name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="room"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Room</FormLabel>
											<FormControl>
												<Input
													className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
													placeholder="Room Name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
													className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
										"Sign Up"
									)}
								</Button>
							</form>
						</Form>
						<div className="text-center mt-4 mb-4">
							<p>
								<span>Already a member?</span>
								<Link
									to="/sign-in"
									className="text-blue-600 hover:text-blue-800 ml-2"
								>
									Sign In
								</Link>
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default SignUp;
