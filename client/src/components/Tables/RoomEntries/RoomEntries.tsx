import { useCookies } from "react-cookie";
import { useEffect, useMemo, useState } from "react";
import {
  deleteEntryAction,
  getEntryAction,
  paymentRequestAction,
} from "../../../api/entry";
import { CurrentUser, EntryType, RoomMembers } from "../../../types/types";
import { useToast } from "../../ui/use-toast";
import {
  CalendarIcon,
  ChevronDown,
  Circle,
  CircleCheck,
  CircleDashed,
  HandCoins,
  Info,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../ui/pagination";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

import { Button } from "../../ui/button";
import { cn, formatDate } from "../../../lib/utils";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { setCurrentUser } from "../../../store/userSlice";
import { Skeleton } from "../../ui/skeleton";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../../ui/calendar";
import { getRoomDetailsAction } from "../../../api/room";
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { MobileView } from "./MobileView";

const RoomEntries = () => {
  const { isMobile } = useBreakpoint();
  const [rows, setRows] = useState<EntryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [, setCheckboxStates] = useState<{ [key: string]: boolean }>({});
  const [, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalEntries, setTotalEntries] = useState<number>(1);
  const [cookies] = useCookies();
  const token = cookies.token;
  const { toast } = useToast();
  const [pageLimit, setPageLimit] = useState<string>("10");
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [roomMembers, setRoomMembers] = useState<RoomMembers[]>([]);
  const fetchEntries = async (page: number, filter?: boolean) => {
    setLoading(true);
    try {
      let response;
      if (filter) {
        setDate(undefined);
        response = await getEntryAction(page, parseInt(pageLimit), token);
      } else {
        response = await getEntryAction(
          page,
          parseInt(pageLimit),
          token,
          date?.from,
          date?.to
        );
      }

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch entries",
          description: "Something went wrong",
        });
      } else {
        setRows(response.data);
        const userData: CurrentUser = response.user;
        dispatch(setCurrentUser(userData));
        setTotalPages(response.pagination.totalPages);
        setTotalEntries(response.pagination.totalEntries);
        setCurrentPage(page);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch entries",
        description: error as string,
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark as paid to all entries
  const handleMarkAsPaid = async (targetUserId: string) => {
    setLoading(true);
    try {
      const response = await getEntryAction(1, parseInt(pageLimit), token);
      if (response.error) {
        throw new Error("Failed to fetch entries");
      }

      const userData: CurrentUser = response.user;
      const entries: EntryType[] = response.data;

      let entriesToMarkAsPaid = entries.filter(
        (entry) =>
          entry.members.find((member) => member.userId === userData.userId)
            ?.paidStatus === false &&
          entry.members.find((member) => member.userId === userData.userId)
            ?.isPending === false
      );
      if (targetUserId !== "All") {
        entriesToMarkAsPaid = entriesToMarkAsPaid.filter(
          (entry) => entry.paidBy === targetUserId
        );
      }
      if (entriesToMarkAsPaid.length === 0) {
        toast({
          variant: "default",
          title: "No entries to mark as paid",
          description: "All entries are already paid",
        });
        return;
      }

      const updatePromises = entriesToMarkAsPaid.map((entry) =>
        paymentRequestAction(entry._id, token)
      );

      const results = await Promise.all(updatePromises);
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        toast({
          title: "Request sent successfully",
          description: "Paid request sent to the Entry Owner Successfully",
          variant: "default",
        });
        await fetchEntries(currentPage);
      } else {
        throw new Error("Failed to send some requests");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to mark entries as paid",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchMembers() {
      try {
        const roomDetails = await getRoomDetailsAction(token);   
        setRoomMembers(roomDetails.members);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    }

    fetchMembers();
  }, [token]);

  const handleUpdateEntry = async (data: EntryType) => {
    const updateEntryStatus = await paymentRequestAction(data._id, token);
    if (updateEntryStatus.success) {
      toast({
        title: "Request sent successfully",
        description: "Paid request sent to the Entry Owner Successfully",
        variant: "default",
      });
      await fetchEntries(currentPage);
    } else {
      toast({
        title: "Failed to sent request",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
    setOpen(false);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      const deleteResult = await deleteEntryAction(id, token);
      if (deleteResult.success) {
        const newRows = rows.filter((row) => row._id !== id);
        setRows(newRows);
        toast({
          title: "Entry Deleted successfully!",
          description: "Entry is removed and Ledger is updated successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Failed to delete entry",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to delete entry",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEntries(currentPage);
  }, []);

  useEffect(() => {
    fetchEntries(currentPage);
  }, [pageLimit]);

  const generateOptions = useMemo((): string[] => {
    const standardOptions = [10, 25, 50, 100];
    const options: number[] = standardOptions.filter(
      (option) => option <= totalEntries
    );

    // Add totalEntries as an option if it's not already included
    if (!options.includes(totalEntries) && totalEntries > 0) {
      options.push(totalEntries);
    }

    // Sort options and convert to strings
    return options.sort((a, b) => a - b).map(String);
  }, [totalEntries]);

  useEffect(() => {
    const initialCheckboxStates = rows.reduce((acc, row) => {
      acc[row._id] = row.status;
      return acc;
    }, {} as { [key: string]: boolean });
    setCheckboxStates(initialCheckboxStates);
  }, [rows]);

  const handlePaginationClick = (page: number) => {
    fetchEntries(page);
  };

  const getPaginationPages = (currentPage: number, totalPages: number) => {
    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(currentPage + 2, totalPages);

    if (currentPage === 1) {
      endPage = Math.min(4, totalPages);
    }
    if (currentPage === totalPages) {
      startPage = Math.max(totalPages - 3, 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <>
        <div className="relative w-full overflow-auto">
          <div className="inline-block mb-4">
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-8 w-1/5" />
          </div>
          <Skeleton className="h-6 w-1/3 mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full table-auto min-w-max">
              <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
                <tr className="border-b">
                  {[
                    "Date",
                    "Name",
                    "मकसद",
                    "Amount",
                    "Status",
                    "Delete",
                    "Info",
                  ].map((_header, index) => (
                    <th key={index} scope="col" className="px-6 py-3 text-left">
                      <Skeleton className="h-4 w-full" />
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>

              <tfoot className="bg-gray-200 dark:bg-gray-800">
                <tr>
                  <th scope="row" className="px-6 py-3 text-base text-left">
                    <Skeleton className="h-4 w-full" />
                  </th>
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          {/* Pagination controls */}
          <div className="pagination mt-2 flex space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-8" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentUser?.roomName}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage room expenses and track payments
          </p>
        </div>
        <Link
          to="/new-entry"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border mb-6">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Filters
          </h3>
        </div>

        {isMobile ? (
          // Mobile Vertical Layout
          <div className="p-4 space-y-4">
            {/* Entries per page */}
            <div className="w-full">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">
                Entries per page
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {pageLimit} entries
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]">
                  <DropdownMenuLabel>Select entries</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={pageLimit}
                    onValueChange={setPageLimit}
                  >
                    {generateOptions.map((option) => (
                      <DropdownMenuRadioItem key={option} value={option}>
                        {option} entries
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date Range Picker */}
            <div className="w-full">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1.5 block">
                Date range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM d, y")} -{" "}
                          {format(date.to, "MMM d, y")}
                        </>
                      ) : (
                        format(date.from, "MMM d, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={date == undefined}
                variant="secondary"
                onClick={() => fetchEntries(1)}
              >
                Apply Filter
              </Button>
              <Button
                className="flex-1"
                disabled={date == undefined}
                variant="outline"
                onClick={() => fetchEntries(1, true)}
              >
                Reset
              </Button>
            </div>

             {/* Mark Payments Button */}
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 
                      dark:bg-blue-500 dark:hover:bg-blue-600 text-white w-full"
                  >
                    Mark Payments
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Select Payment Action</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose a user to mark their payments or mark all as paid.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-2">
                    <AlertDialogAction
                      onClick={() => handleMarkAsPaid("All")}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Mark All as Paid
                    </AlertDialogAction>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or select individual user
                        </span>
                      </div>
                    </div>

                    {roomMembers.map((member) => (
                      <AlertDialogAction
                        key={member._id}
                        onClick={() => handleMarkAsPaid(member.userId)}
                        className="w-full bg-gray-100 hover:bg-gray-200 
                          dark:bg-gray-800 dark:hover:bg-gray-700 text-white"
                      >
                        Mark {member.userName}'s Payments
                      </AlertDialogAction>
                    ))}
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
                      Cancel
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        ) : (
          // Desktop Horizontal Layout
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Entries per page */}
              <div className="w-48">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-gray-200 dark:border-gray-700
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {pageLimit} entries
                      <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuLabel>Select entries</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={pageLimit}
                      onValueChange={setPageLimit}
                    >
                      {generateOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option}
                          value={option}
                          className="cursor-pointer"
                        >
                          {option} entries
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Date Range Picker */}
              <div className="w-[300px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700",
                        !date && "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "MMM d, y")} -{" "}
                            {format(date.to, "MMM d, y")}
                          </>
                        ) : (
                          format(date.from, "MMM d, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      className="rounded-md border border-gray-200 dark:border-gray-700"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-2">
                <Button
                  disabled={date == undefined}
                  variant="secondary"
                  onClick={() => fetchEntries(1)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900
                    dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100
                    border border-gray-200 dark:border-gray-700"
                >
                  Apply Filter
                </Button>
                <Button
                  disabled={date == undefined}
                  variant="outline"
                  onClick={() => fetchEntries(1, true)}
                  className="border-gray-200 dark:border-gray-700
                    hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Reset
                </Button>
              </div>

              {/* Mark Payments Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700 
                      dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                  >
                    Mark Payments
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Select Payment Action</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose a user to mark their payments or mark all as paid.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-2">
                    <AlertDialogAction
                      onClick={() => handleMarkAsPaid("All")}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Mark All as Paid
                    </AlertDialogAction>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or select individual user
                        </span>
                      </div>
                    </div>

                    {roomMembers.map((member) => (
                      <AlertDialogAction
                        key={member._id}
                        onClick={() => handleMarkAsPaid(member.userId)}
                        className="w-full bg-gray-100 hover:bg-gray-200 
                          dark:bg-gray-800 dark:hover:bg-gray-700 text-white"
                      >
                        Mark {member.userName}'s Payments
                      </AlertDialogAction>
                    ))}
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
                      Cancel
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Room Entries</h2>
        </div>

        {loading ? (
          <>
            <div className="relative w-full overflow-auto">
              <div className="inline-block mb-4">
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-8 w-1/5" />
              </div>
              <Skeleton className="h-6 w-1/3 mb-4" />
              <div className="overflow-x-auto">
                <table className="w-full table-auto min-w-max">
                  <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
                    <tr className="border-b">
                      {[
                        "Date",
                        "Name",
                        "मकसद",
                        "Amount",
                        "Status",
                        "Delete",
                        "Info",
                      ].map((_header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left"
                        >
                          <Skeleton className="h-4 w-full" />
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {Array.from({ length: 7 }).map((_, colIndex) => (
                          <td key={colIndex} className="px-6 py-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>

                  <tfoot className="bg-gray-200 dark:bg-gray-800">
                    <tr>
                      <th scope="row" className="px-6 py-3 text-base text-left">
                        <Skeleton className="h-4 w-full" />
                      </th>
                      {Array.from({ length: 6 }).map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
              {/* Pagination controls */}
              <div className="pagination mt-2 flex space-x-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-8 w-8" />
                ))}
              </div>
            </div>
          </>
        ) : isMobile ? (
          <MobileView
            rows={rows}
            currentUser={currentUser}
            handleUpdateEntry={handleUpdateEntry}
            handleDeleteClick={handleDeleteClick}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Delete
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Info
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(new Date(row.date))}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {row.members.find(
                          (member) => member.userId === row.paidBy
                        )?.userName || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm">{row.description}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {(() => {
                          const currentUserMember = row.members.find(
                            (member) => member.userId === currentUser.userId
                          );
                          if (currentUserMember?.isPending) {
                            return (
                              <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                                <CircleDashed className="w-4 h-4 mr-2" />
                                <span>Pending</span>
                              </div>
                            );
                          } else if (currentUserMember?.paidStatus) {
                            return (
                              <div className="flex items-center text-green-500 dark:text-green-400">
                                <CircleCheck className="w-4 h-4 mr-2" />
                                <span>Paid</span>
                              </div>
                            );
                          } else if (
                            currentUserMember &&
                            !currentUserMember.paidStatus
                          ) {
                            return (
                              <button
                                onClick={() => handleUpdateEntry(row)}
                                className="inline-flex items-center px-3 py-1 rounded-md text-sm
                          bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 
                          dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                              >
                                <HandCoins className="w-4 h-4 mr-1" />
                                Pay ₹
                                {Math.round(
                                  row.amount / row.members.length
                                ).toLocaleString("en-IN")}
                              </button>
                            );
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        {row.paidBy === currentUser.userId &&
                          row.members.filter(
                            (member) =>
                              member.paidStatus &&
                              member.userId !== currentUser.userId
                          ).length === 0 && (
                            <button
                              onClick={() => handleDeleteClick(row._id)}
                              className="inline-flex items-center p-2 text-red-600 hover:text-red-800 
                      dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                      </td>
                      <td className="px-6 py-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm
                      bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 
                      dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Info className="w-4 h-4 mr-1" />
                              View Split
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <span>Split Details</span>
                                <span className="text-sm font-normal text-gray-500">
                                  (₹{row.amount.toLocaleString("en-IN")})
                                </span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              {row.members.map((member, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    member.paidStatus
                                      ? "bg-green-50 dark:bg-green-900/20"
                                      : "bg-gray-50 dark:bg-gray-800"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {member.paidStatus ? (
                                      <CircleCheck className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span>{member.userName}</span>
                                  </div>
                                  <span className="font-medium">
                                    ₹
                                    {Math.round(
                                      row.amount / row.members.length
                                    ).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold">
                <tr>
                  <td className="px-6 py-4">Total</td>
                  <td colSpan={2}></td>
                  <td className="px-6 py-4">
                    ₹
                    {rows
                      .reduce((sum, row) => sum + row.amount, 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="w-full mt-4">
        <Pagination>
          <PaginationContent className="flex flex-wrap items-center justify-center gap-2">
            {/* Previous Button */}
            <PaginationItem className="hidden sm:block">
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) handlePaginationClick(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {/* Mobile Previous Button */}
            <PaginationItem className="sm:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (currentPage > 1) handlePaginationClick(currentPage - 1);
                }}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>

            {/* Simplified Mobile View */}
            <div className="flex items-center gap-1 sm:hidden">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden sm:flex items-center gap-1">
              {/* First page when not in range */}
              {getPaginationPages(currentPage, totalPages)[0] > 1 && (
                <>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePaginationClick(1);
                      }}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {getPaginationPages(currentPage, totalPages)[0] > 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Page numbers */}
              {getPaginationPages(currentPage, totalPages).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePaginationClick(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Last page when not in range */}
              {getPaginationPages(currentPage, totalPages).slice(-1)[0] <
                totalPages && (
                <>
                  {getPaginationPages(currentPage, totalPages).slice(-1)[0] <
                    totalPages - 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePaginationClick(totalPages);
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
            </div>

            {/* Next Button Desktop */}
            <PaginationItem className="hidden sm:block">
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages)
                    handlePaginationClick(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {/* Mobile Next Button */}
            <PaginationItem className="sm:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (currentPage < totalPages)
                    handlePaginationClick(currentPage + 1);
                }}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default RoomEntries;
