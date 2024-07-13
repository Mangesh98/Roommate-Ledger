import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Controller } from "react-hook-form";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

interface DatePickerProps {
	control: any;
	name: string;
}

export function DatePicker({ control, name }: DatePickerProps) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant={"outline"}
							className={`w-[280px] justify-start text-left font-normal ${
								!field.value && "text-muted-foreground"
							}`}
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{field.value ? (
								format(new Date(field.value), "PPP")
							) : (
								<span>Pick a date</span>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={field.value ? new Date(field.value) : undefined}
							onSelect={(date) => field.onChange(date?.toISOString())}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			)}
		/>
	);
}
