import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import {
  getPendingRequestsAction,
  updateEntryAction,
} from "../../../api/entry";
import { EntryType, UpdateEntry } from "../../../types/types";

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

import { Circle, CircleCheck, Info } from "lucide-react";
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

const PaymentConfirmation = () => {
  const pageLimit = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rows, setRows] = useState<EntryType[]>([]);
  const [cookies] = useCookies();
  const token = cookies.token;
  const [loading, setLoading] = useState<boolean>(true);

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
      // console.log(updateRecord);

      const updateEntryStatus = await updateEntryAction(updateRecord, token);
      // console.log(updateEntryStatus);

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

      // console.log(data);
    } catch (error) {
      toast({
        title: "Failed to update entry",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  }

  async function handleMarkAllAsPaid() {
    setLoading(true);
    try {
      const updatePromises = filteredRows.flatMap((row) =>
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

      const results = await Promise.all(updatePromises);

      const allSuccess = results.every((result) => result.success);

      if (allSuccess) {
        toast({
          title: "All entries updated successfully",
          description:
            "All entries are marked as paid and the ledger is updated successfully",
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
    <>
      <div className="relative w-full overflow-auto">
        <h2 className="mb-2">My Entries</h2>
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Mark All as Paid</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will update all pending
                  requests as paid and update the ledger of all associated
                  users.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="ghost">Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button variant="destructive" onClick={handleMarkAllAsPaid}>
                    Continue
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-max">
            <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
              <tr className="border-b">
                <th scope="col" className="px-6 py-3 text-left">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Info
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  Confirm Payment
                </th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-900 dark:text-white divide-y divide-gray-200 dark:divide-gray-700">
              {rows.length === 0 ? (
                <tr className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                rows.flatMap((row) =>
                  row.members
                    .filter((member) => member.isPending)
                    .map((pendingMember, idx) => (
                      <tr
                        key={`${row._id}-${idx}`} // unique key by combining row id and index
                        className="border-b transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(new Date(row.date))}
                        </td>
                        <td className="px-6 py-4">{pendingMember.userName}</td>
                        <td className="px-6 py-4">
                          &#8377;
                          {Math.round(row.amount / row.members.length)}
                        </td>
                        <td className="px-6 py-4">{row.description}</td>
                        <td className="px-6 py-4">
                          <Dialog aria-labelledby="dialog-title">
                            <DialogTrigger asChild className="cursor-pointer">
                              <Info />
                            </DialogTrigger>
                            <DialogContent aria-describedby={row.description}>
                              <DialogHeader>
                                <DialogTitle>Members</DialogTitle>
                                <div id="dialog-description">
                                  <ul className="mt-2 max-w-md space-y-1 text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-2">
                                    {row.members.map((member, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center"
                                      >
                                        {member.paidStatus ? (
                                          <CircleCheck className="w-3.5 h-3.5 me-1 text-green-500 dark:text-green-400 flex-shrink-0" />
                                        ) : (
                                          <Circle className="w-3.5 h-3.5 me-2 flex-shrink-0" />
                                        )}
                                        <div>
                                          <span>{member.userName}</span>
                                          <span className="ml-2">
                                            &#8377;
                                            {Math.round(
                                              row.amount / row.members.length
                                            )}
                                          </span>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </DialogHeader>
                              <DialogDescription>
                                <label className="mt-1 block">
                                  Total Amount : &#8377; {row.amount}
                                </label>
                                <label className="mt-1 block">
                                  Created At :
                                  <span
                                    style={{ marginLeft: "8px" }}
                                  >{`${new Date(row.createdAt)
                                    .toLocaleDateString("en-GB")
                                    .replace(/\//g, "-")} ${new Date(
                                    row.createdAt
                                  ).toLocaleTimeString()}`}</span>
                                </label>
                              </DialogDescription>
                            </DialogContent>
                          </Dialog>
                        </td>

                        <td className="px-6 py-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="inline-block mt-2 text-sm font-medium text-green-900 bg-white border border-gray-300 rounded-lg px-5 py-2.5 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-green-900 dark:text-white dark:border-white dark:hover:bg-green-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                                Confirm
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will update
                                  the record as paid and update the ledger of
                                  all associated users.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel asChild>
                                  <Button variant="ghost">Cancel</Button>
                                </AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleConfirm(row, pendingMember.userId)
                                    }
                                  >
                                    Continue
                                  </Button>
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

            <tfoot className="bg-gray-200 dark:bg-gray-800">
              <tr>
                <td scope="row" className="px-6 py-3 text-base text-left">
                  Total
                </td>
                <td className="px-6 py-3"></td>
                <td className="px-6 py-3">
                  &#8377;
                  {filteredRows.reduce((sum, row) => sum + row.amount, 0)}
                </td>
                <td className="px-6 py-3"></td>
                <td className="px-6 py-3"></td>
                <td className="px-6 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="pagination mt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
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
              <PaginationItem>
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
    </>
  );
};

export default PaymentConfirmation;
