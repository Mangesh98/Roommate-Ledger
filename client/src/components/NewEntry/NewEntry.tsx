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
		<div className="container mx-auto px-4 py-8">
		  {/* Header Section */}
		  <div className="max-w-2xl mx-auto mb-8">
			<div className="flex justify-between items-center">
			  <div>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
				  New Entry
				</h1>
				<p className="mt-2 text-gray-600 dark:text-gray-400">
				  Add a new expense entry to your room ledger
				</p>
			  </div>
			  <Link
				to="/"
				className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 
				  bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 
				  dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
			  >
				← Back to Entries
			  </Link>
			</div>
		  </div>
	
		  {/* Form Section */}
		  <div className="max-w-2xl mx-auto">
			<div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-6">
			  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Description Field */}
				<div className="space-y-2">
				  <label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-gray-200">
					Description
				  </label>
				  <textarea
					id="description"
					{...register("description")}
					rows={4}
					className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 
					  focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 
					  dark:text-white dark:placeholder-gray-400"
					placeholder="What's this expense for?"
				  />
				  {errors.description && (
					<p className="text-sm text-red-500">{errors.description.message}</p>
				  )}
				</div>
	
				{/* Category Field */}
				<div className="space-y-2">
				  <label htmlFor="categories" className="text-sm font-medium text-gray-900 dark:text-gray-200">
					Category
				  </label>
				  <Controller
					name="category"
					control={control}
					render={({ field }) => (
					  <Select onValueChange={field.onChange}>
						<SelectTrigger className="w-full">
						  <SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
						  {categories.map((category) => (
							<SelectItem
							  key={category._id}
							  value={category._id}
							  className="cursor-pointer"
							>
							  {category.name}
							</SelectItem>
						  ))}
						</SelectContent>
					  </Select>
					)}
				  />
				  {errors.category && (
					<p className="text-sm text-red-500">{errors.category.message}</p>
				  )}
				</div>
	
				{/* Amount Field */}
				<div className="space-y-2">
				  <label htmlFor="price" className="text-sm font-medium text-gray-900 dark:text-gray-200">
					Amount
				  </label>
				  <div className="relative">
					<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
					<input
					  type="number"
					  id="price"
					  {...register("price", { valueAsNumber: true })}
					  className="w-full rounded-lg border border-gray-300 bg-white pl-8 pr-4 py-2 
						text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 
						dark:bg-gray-800 dark:text-white"
					  placeholder="0.00"
					/>
				  </div>
				  {errors.price && (
					<p className="text-sm text-red-500">{errors.price.message}</p>
				  )}
				</div>
	
				{/* Date Field */}
				<div className="space-y-2">
				  <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
					Date
				  </label>
				  <Controller
					control={control}
					name="date"
					render={() => (
					  <Popover>
						<PopoverTrigger asChild>
						  <Button
							variant="outline"
							className={cn(
							  "w-full justify-start text-left",
							  !date && "text-muted-foreground"
							)}
						  >
							<CalendarIcon className="mr-2 h-4 w-4" />
							{date ? format(date, "PPP") : <span>Pick a date</span>}
						  </Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0" align="start">
						  <Calendar
							mode="single"
							selected={date}
							onSelect={(selectedDate) => {
							  setDate(selectedDate);
							  setValue("date", selectedDate?.toISOString().split("T")[0] || "");
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
					<p className="text-sm text-red-500">{errors.date.message}</p>
				  )}
				</div>
	
				{/* Members Selection */}
				<div className="space-y-2">
				  <label className="text-sm font-medium text-gray-900 dark:text-gray-200">
					Split Between
				  </label>
				  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					{roomMembers.map((member) => (
					  <div key={member.userId} className="relative">
						<input
						  type="checkbox"
						  id={member.userId}
						  {...register("selectedMembers")}
						  value={member.userId}
						  className="peer hidden"
						/>
						<label
						  htmlFor={member.userId}
						  className="flex items-center p-3 w-full text-sm rounded-lg border cursor-pointer
							border-gray-300 bg-white text-gray-900 hover:bg-gray-50
							peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600
							dark:border-gray-600 dark:bg-gray-800 dark:text-white
							dark:hover:bg-gray-700 dark:peer-checked:bg-blue-900/20
							transition-colors"
						>
						  {member.userName}
						</label>
					  </div>
					))}
				  </div>
				  {errors.selectedMembers && (
					<p className="text-sm text-red-500">{errors.selectedMembers.message}</p>
				  )}
				</div>
	
				{/* Submit Button */}
				<Button
				  type="submit"
				  disabled={isSubmitting}
				  className="w-full"
				>
				  {isSubmitting ? (
					<div className="flex items-center justify-center">
					  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
					  <span>Creating entry...</span>
					</div>
				  ) : (
					"Create Entry"
				  )}
				</Button>
			  </form>
			</div>
		  </div>
		</div>
	  );
	};
export default NewEntry;
