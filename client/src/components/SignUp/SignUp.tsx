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

const SignUp = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
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
			if (result.success) {
				toast({
					variant: "default",
					title: "Account created successfully",
					description: "Please check your email to verify your account",
				});

				navigate("/sign-in");
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
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
		  <div className="sm:mx-auto sm:w-full sm:max-w-md">
			<div className="text-center">
			  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
				Create your account
			  </h1>
			  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
				Join Roommate Ledger to manage your shared expenses
			  </p>
			</div>
		  </div>
	
		  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
			<div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg rounded-lg sm:px-10">
			  <Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				  <FormField
					control={form.control}
					name="name"
					render={({ field }) => (
					  <FormItem>
						<FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						  Full Name
						</FormLabel>
						<FormControl>
						  <Input
							placeholder="Nana Narute"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
							  focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 
							  dark:bg-gray-700 dark:text-white sm:text-sm"
							{...field}
						  />
						</FormControl>
						<FormMessage className="mt-2 text-sm text-red-600 dark:text-red-400" />
					  </FormItem>
					)}
				  />
	
				  <FormField
					control={form.control}
					name="room"
					render={({ field }) => (
					  <FormItem>
						<FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						  Room Name
						</FormLabel>
						<FormControl>
						  <Input
							placeholder="e.g. Apartment 42"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
							  focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 
							  dark:bg-gray-700 dark:text-white sm:text-sm"
							{...field}
						  />
						</FormControl>
						<FormMessage className="mt-2 text-sm text-red-600 dark:text-red-400" />
					  </FormItem>
					)}
				  />
	
				  <FormField
					control={form.control}
					name="email"
					render={({ field }) => (
					  <FormItem>
						<FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						  Email address
						</FormLabel>
						<FormControl>
						  <Input
							type="email"
							placeholder="you@example.com"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
							  focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 
							  dark:bg-gray-700 dark:text-white sm:text-sm"
							{...field}
						  />
						</FormControl>
						<FormMessage className="mt-2 text-sm text-red-600 dark:text-red-400" />
					  </FormItem>
					)}
				  />
	
				  <FormField
					control={form.control}
					name="password"
					render={({ field }) => (
					  <FormItem>
						<FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						  Password
						</FormLabel>
						<FormControl>
						  <Input
							type="password"
							placeholder="••••••••"
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
							  focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 
							  dark:bg-gray-700 dark:text-white sm:text-sm"
							{...field}
						  />
						</FormControl>
						<FormMessage className="mt-2 text-sm text-red-600 dark:text-red-400" />
					  </FormItem>
					)}
				  />
	
				  <Button
					type="submit"
					disabled={isSubmitting}
					className="w-full flex justify-center py-2 px-4 border border-transparent 
					  rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
					  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
					  focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
					  dark:bg-blue-600 dark:hover:bg-blue-700"
				  >
					{isSubmitting ? (
					  <div className="flex items-center">
						<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
						Creating account...
					  </div>
					) : (
					  "Create Account"
					)}
				  </Button>
				</form>
			  </Form>
	
			  <div className="mt-6">
				<div className="relative">
				  <div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-300 dark:border-gray-600" />
				  </div>
				  <div className="relative flex justify-center text-sm">
					<span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
					  Already have an account?
					</span>
				  </div>
				</div>
	
				<div className="mt-6 text-center">
				  <Link
					to="/sign-in"
					className="text-sm font-medium text-blue-600 hover:text-blue-500 
					  dark:text-blue-400 dark:hover:text-blue-300"
				  >
					Sign in to your account →
				  </Link>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  );
	};
	
	export default SignUp;
