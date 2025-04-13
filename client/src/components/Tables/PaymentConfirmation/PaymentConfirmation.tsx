import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import {
  getPendingRequestsAction,
  updateEntryAction,
} from "../../../api/entry";
import { EntryType, RoomMembers, UpdateEntry } from "../../../types/types";

import { formatDate } from "../../../lib/utils";

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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

import {
  Circle,
  CircleCheck,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "../../ui/skeleton";
import { Button } from "../../ui/button";
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../ui/alert-dialog";
import { toast } from "../../ui/use-toast";
import { getRoomDetailsAction } from "../../../api/room";

const PaymentConfirmation = () => {
  const pageLimit = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rows, setRows] = useState<EntryType[]>([]);
  const [cookies] = useCookies();
  const token = cookies.token;
  const [loading, setLoading] = useState<boolean>(true);

  const [roomMembers, setRoomMembers] = useState<RoomMembers[]>([]);

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

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const result = await getPendingRequestsAction(page, pageLimit, token);
      // console.log("pending requests ", result.data);
      if (result.success) {
        setRows(result.data);
        setCurrentPage(page);
        setTotalPages(result.pagination.totalPages);
      } else {
        setRows([]);
        setCurrentPage(1);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching My Entries", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, token]);

  const handlePaginationClick = (page: number) => {
    fetchData(page);
  };

  const filteredRows = rows.filter((row) =>
    row.members.some((member) => member.isPending)
  );
  async function handleConfirm(data: EntryType, EntryUserId: string) {
    setLoading(true);
    try {
      const updateRecord: UpdateEntry = {
        entryId: data._id,
        paidBy: data.paidBy,
        amount: Math.round(data.amount / data.members.length),
        userId: EntryUserId,
      };
      const updateEntryStatus = await updateEntryAction(updateRecord, token);

      if (updateEntryStatus.success) {
        toast({
          title: "Entry updated successfully",
          description: "Entry is removed and Ledger is updated successfully",
          variant: "default",
        });
        await fetchData(currentPage);
      } else {
        toast({
          title: "Failed to update entry",
          description: "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update entry",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  }

  async function handleMarkAllAsPaid(targetUserId: string) {
    setLoading(true);
    try {
      let entriesToProcess = filteredRows;
      // Filter entries based on targetUserId if specified

      if (targetUserId !== "All") {
        // Find entries where the targeted user is a member
        entriesToProcess = filteredRows.filter((row) =>
          row.members.some(
            (member) => member.userId === targetUserId && member.isPending
          )
        );
      }

      const updatePromises = entriesToProcess.flatMap((row) =>
        row.members
          .filter((member) => member.isPending)
          .map((pendingMember) => {
            const updateRecord: UpdateEntry = {
              entryId: row._id,
              paidBy: row.paidBy,
              amount: Math.round(row.amount / row.members.length),
              userId: pendingMember.userId,
            };
            return updateEntryAction(updateRecord, token);
          })
      );

      if (updatePromises.length === 0) {
        toast({
          variant: "default",
          title: "No entries to mark as paid",
          description: "All entries are already paid",
        });
        setLoading(false);
        return;
      }

      const results = await Promise.all(updatePromises);
      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        toast({
          title: "All entries updated successfully",
          description:
            "Selected entries are marked as paid and the ledger is updated successfully",
          variant: "default",
        });
        await fetchData(currentPage);
      } else {
        toast({
          title: "Failed to update some entries",
          description: "Some entries could not be updated",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update entries",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <div className="relative w-full overflow-auto">
          <h2 className="mb-2">Payment Confirmation</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto min-w-max">
              <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
                <tr className="border-b">
                  {["Date", "मकसद", "Amount", "Info"].map((_header, index) => (
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
                    {Array.from({ length: 4 }).map((_, colIndex) => (
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
                  {Array.from({ length: 3 }).map((_, colIndex) => (
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Payment Confirmations
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Review and confirm pending payments
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
            >
              Mark Payments
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Select Payment Action</AlertDialogTitle>
              <AlertDialogDescription>
                Choose a user to mark their payments or mark all as paid.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2">
              <AlertDialogAction
                onClick={() => handleMarkAllAsPaid("All")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Mark All as Paid
              </AlertDialogAction>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
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
                  onClick={() => handleMarkAllAsPaid(member.userId)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-white"
                >
                  Mark {member.userName}'s Payments
                </AlertDialogAction>
              ))}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border">
        {/* Mobile View Stats */}
        <div className="md:hidden p-4 border-b">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Pending
              </p>
              <p className="text-lg font-semibold mt-1">
                {rows.reduce(
                  (sum, row) =>
                    sum + row.members.filter((m) => m.isPending).length,
                  0
                )}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
              <p className="text-lg font-semibold mt-1">
                ₹
                {filteredRows
                  .reduce((sum, row) => sum + row.amount, 0)
                  .toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                    Amount
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
                    Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No pending payments found
                    </td>
                  </tr>
                ) : (
                  rows.flatMap((row) =>
                    row.members
                      .filter((member) => member.isPending)
                      .map((pendingMember, idx) => (
                        <tr
                          key={`${row._id}-${idx}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(new Date(row.date))}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            {pendingMember.userName}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            ₹
                            {Math.round(
                              row.amount / row.members.length
                            ).toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {row.description}
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
                                <DialogDescription className="text-sm text-gray-500 pt-2 border-t">
                                  Created on{" "}
                                  {new Date(row.createdAt).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </DialogDescription>
                              </DialogContent>
                            </Dialog>
                          </td>
                          <td className="px-6 py-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button className="bg-green-500 hover:bg-green-600 text-white">
                                  Confirm Payment
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Confirm Payment
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to mark this payment
                                    as complete? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleConfirm(row, pendingMember.userId)
                                    }
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    Confirm
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))
                  )
                )}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold">
                <tr>
                  <td className="px-6 py-4">Total</td>
                  <td></td>
                  <td className="px-6 py-4">
                    ₹
                    {filteredRows
                      .reduce((sum, row) => sum + row.amount, 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {rows.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending payments found
              </div>
            ) : (
              rows.flatMap((row) =>
                row.members
                  .filter((member) => member.isPending)
                  .map((pendingMember, idx) => (
                    <div key={`${row._id}-${idx}`} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {pendingMember.userName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(new Date(row.date))}
                          </p>
                        </div>
                        <span className="font-medium text-lg">
                          ₹
                          {Math.round(
                            row.amount / row.members.length
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {row.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="inline-flex items-center px-3 py-1.5 rounded-md text-sm
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
                            <DialogDescription className="text-sm text-gray-500 pt-2 border-t">
                              Created on{" "}
                              {new Date(row.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </DialogDescription>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="bg-green-500 hover:bg-green-600 text-white">
                              Confirm Payment
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirm Payment
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to mark this payment as
                                complete? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleConfirm(row, pendingMember.userId)
                                }
                                className="bg-green-500 hover:bg-green-600 text-white"
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))
              )
            )}
          </div>
        </div>

        {/* Responsive Pagination */}
        <div className="p-4 border-t">
          <Pagination>
            <PaginationContent className="flex flex-wrap items-center justify-center gap-2">
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

              {/* Desktop Previous Button */}
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

              {/* Mobile Page Info */}
              <div className="flex items-center gap-1 sm:hidden">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              {/* Desktop Page Numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePaginationClick(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </div>

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

              {/* Desktop Next Button */}
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
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
