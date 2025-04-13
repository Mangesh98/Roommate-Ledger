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
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { useBreakpoint } from "../../hooks/useBreakpoint";

const NewEntry = () => {
  const router = useNavigate();
  const [cookies] = useCookies();
  const token = cookies.token;
  const { toast } = useToast();
  const [roomMembers, setRoomMembers] = useState<RoomMembers[]>([]);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [date, setDate] = useState<Date>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobile } = useBreakpoint();

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
      <div className={cn("mx-auto mb-8", isMobile ? "w-full" : "max-w-2xl")}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              New Entry
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Add a new expense entry to your room ledger
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center px-3 sm:px-4 py-2 rounded-lg 
              border border-gray-200 dark:border-gray-700
              bg-white hover:bg-gray-50 
              dark:bg-gray-800 dark:hover:bg-gray-700 
              text-gray-700 dark:text-gray-200
              transition-colors text-sm"
          >
            ← Back to Entries
          </Link>
        </div>
      </div>

      {/* Form Section */}
      <div className={cn("mx-auto", isMobile ? "w-full" : "max-w-2xl")}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
          >
            {/* Description Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={isMobile ? 3 : 4}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700
                  bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-500 dark:placeholder-gray-400
                  px-3 sm:px-4 py-2
                  focus:border-blue-500 dark:focus:border-blue-400 
                  focus:ring-blue-500 dark:focus:ring-blue-400
                  text-sm sm:text-base"
                placeholder="What's this expense for?"
              />
              {errors.description && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category and Amount Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Category Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger
                        className="w-full border-gray-200 dark:border-gray-700 
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category._id}
                            value={category._id}
                            className="cursor-pointer text-gray-900 dark:text-gray-100"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Amount Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100
                      pl-8 pr-4 py-2
                      focus:border-blue-500 dark:focus:border-blue-400
                      focus:ring-blue-500 dark:focus:ring-blue-400
                      text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                          "w-full justify-start text-left text-sm sm:text-base border-gray-200 dark:border-gray-700",
                          !date && "text-gray-500 dark:text-gray-400"
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
                          setValue(
                            "date",
                            selectedDate?.toISOString().split("T")[0] || ""
                          );
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        className="rounded-md border border-gray-200 dark:border-gray-700"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Members Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Split Between
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
                      className="flex items-center p-2 sm:p-3 w-full text-sm rounded-lg cursor-pointer
                        border border-gray-200 dark:border-gray-700
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-100
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        peer-checked:border-blue-500 dark:peer-checked:border-blue-400
                        peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20
                        peer-checked:text-blue-600 dark:peer-checked:text-blue-400
                        transition-colors"
                    >
                      {member.userName}
                    </label>
                  </div>
                ))}
              </div>
              {errors.selectedMembers && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.selectedMembers.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                text-white dark:text-gray-100
                disabled:bg-gray-300 dark:disabled:bg-gray-600
                disabled:cursor-not-allowed"
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
