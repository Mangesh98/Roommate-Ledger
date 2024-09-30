import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Categories, EntryFormData, RoomMembers } from "../../types/types";
import { useCookies } from "react-cookie";
import { getRoomDetailsAction } from "../../api/room";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../ui/use-toast";
import { createEntryAction } from "../../api/entry";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Calendar } from "../ui/calendar";
import { addDays, format } from "date-fns";
import { NewEntrySchema } from "../../schemas/entrySchema";
import { PopoverClose } from "@radix-ui/react-popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const NewEntry = () => {
	const router = useNavigate();
	const [cookies] = useCookies();
	const token = cookies.token;
	const { toast } = useToast();
	const [roomMembers, setRoomMembers] = useState<RoomMembers[]>([]);
	const [categories, setCategories] = useState<Categories[]>([]);
	const [date, setDate] = useState<Date>();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<EntryFormData>({
		resolver: zodResolver(NewEntrySchema),
	});

	useEffect(() => {
		async function fetchMembers() {
			try {
				const roomDetails = await getRoomDetailsAction(token);
				setCategories(roomDetails.categories);
				setRoomMembers(roomDetails.members);
			} catch (error) {
				console.error("Failed to fetch members:", error);
			}
		}

		fetchMembers();
	}, [token]);

	const onSubmit = async (data: EntryFormData) => {
		setIsSubmitting(true);
		try {
			const updatedDate = date ? addDays(date, 0).toISOString() : "";
			const response = await createEntryAction(
				{ ...data, date: updatedDate },
				token
			);
			if (!response.success) {
				console.error(response.error);
				toast({
					title: "Failed to create entry..!",
					description: response.error,
					variant: "destructive",
				});
			} else {
				toast({
					title: "Entry created successfully!",
					description: response.message,
					variant: "default",
				});
				router("/");
			}
		} catch (error) {
			toast({
				title: "Failed to create entry..!",
				variant: "destructive",
			});
			console.error("Failed to submit form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
			<Link
				to="/"
				type="button"
				className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 inline-block"
			>
				&larr; Go Back
			</Link>

			<form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto">
				<div className="mb-5">
					<label
						htmlFor="description"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Description
					</label>
					<textarea
						id="description"
						{...register("description")}
						rows={4}
						className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Write your description..."
					/>
					{errors.description && (
						<p className="text-red-500 text-sm">{errors.description.message}</p>
					)}
				</div>
				<div className="mb-5">
					<label
						htmlFor="categories"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Categories
					</label>
					<Controller
						name="category"
						control={control}
						render={({ field }) => (
							<Select onValueChange={(value) => field.onChange(value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select Category" />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category._id} value={category._id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					{errors.category && (
						<p className="text-red-500 text-sm">{errors.category.message}</p>
					)}
				</div>
				<div className="mb-5">
					<label
						htmlFor="price"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Price
					</label>
					<input
						type="number"
						id="price"
						{...register("price", { valueAsNumber: true })}
						className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="₹10"
					/>
					{errors.price && (
						<p className="text-red-500 text-sm">{errors.price.message}</p>
					)}
				</div>

				<div className="mb-5">
					<label
						htmlFor="date"
						className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
					>
						Date
					</label>
					<Controller
						control={control}
						name="date"
						render={() => (
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-full justify-start text-left font-normal",
											!date && "text-muted-foreground"
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{date ? format(date, "PPP") : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0 relative pt-8"
									align="start"
								>
									<PopoverClose className="absolute top-2 right-2">
										<X
											size={24}
											className="text-primary/60 hover:text-destructive"
										/>
									</PopoverClose>
									<Calendar
										mode="single"
										selected={date}
										onSelect={(selectedDate) => {
											setDate(selectedDate);
											setValue(
												"date",
												selectedDate?.toISOString().split("T")[0] || ""
											);
										}}
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						)}
					/>
					{errors.date && (
						<p className="text-red-500 text-sm">{errors.date.message}</p>
					)}
				</div>

				<div className="members mb-4">
					<h3 className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
						Choose Members:
					</h3>
					<ul className="grid w-full gap-6 md:grid-cols-3">
						{roomMembers.map((member) => (
							<li key={member.userId}>
								<input
									type="checkbox"
									id={member.userId}
									{...register("selectedMembers")}
									value={member.userId}
									className="hidden peer"
								/>
								<label
									htmlFor={member.userId}
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground peer-checked:outline-none peer-checked:ring-2 peer-checked:ring-ring peer-checked:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
								>
									<div className="block">
										<div className="w-full text-sm font-semibold">
											{member.userName}
										</div>
									</div>
								</label>
							</li>
						))}
					</ul>
					{errors.selectedMembers && (
						<p className="text-red-500 text-sm">
							{errors.selectedMembers.message}
						</p>
					)}
				</div>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
						</>
					) : (
						"Submit"
					)}
				</Button>
			</form>
		</div>
	);
};
export default NewEntry;
