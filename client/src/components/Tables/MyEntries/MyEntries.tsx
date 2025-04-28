import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { getMyEntryAction } from "../../../api/entry";
import { EntryType } from "../../../types/types";

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
import { useBreakpoint } from "../../../hooks/useBreakpoint";
import { MobileView } from "./MobileView";
import { motion, AnimatePresence } from "framer-motion";

const skeletonVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const MyEntries = () => {
  const pageLimit = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rows, setRows] = useState<EntryType[]>([]);
  const [cookies] = useCookies();
  const token = cookies.token;
  const [loading, setLoading] = useState<boolean>(true);
  const { isMobile } = useBreakpoint();

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const result = await getMyEntryAction(page, pageLimit, token);
      // console.log("MyEntries ", result);
      if (result.success) {
        setRows(result.data);
        setCurrentPage(page);
        setTotalPages(result.pagination.totalPages);
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

  const getPaginationPages = (currentPage: number, totalPages: number) => {
    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxPagesToShow);
    }

    if (currentPage > totalPages - half) {
      start = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Header Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Transactions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            View your personal transaction history
          </p>
        </div>
      </motion.div>

      {/* Content Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-lg border shadow-sm bg-white dark:bg-gray-900"
      >
        {loading ? (
          <motion.div
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full overflow-auto"
          >
            <h2 className="mb-2">My Entries</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-max">
                <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
                  <tr className="border-b">
                    {["Date", "मकसद", "Amount", "Info"].map(
                      (_header, index) => (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left"
                        >
                          <Skeleton className="h-4 w-full" />
                        </th>
                      )
                    )}
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
          </motion.div>
        ) : isMobile ? (
          <MobileView rows={rows} />
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
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {rows.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No transactions found
                      </td>
                    </motion.tr>
                  ) : (
                    rows.map((row, index) => (
                      <motion.tr
                        key={row._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(new Date(row.date))}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {row.description}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          ₹{row.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm
                            bg-gray-50 text-gray-700 hover:bg-gray-100 
                            dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 
                            transition-colors"
                              >
                                <Info className="w-4 h-4 mr-1.5" />
                                View Split
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <motion.div
                                variants={dialogVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                              >
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <span>Split Details</span>
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                      (₹{row.amount.toLocaleString("en-IN")})
                                    </span>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-2 py-4">
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
                                        <span className="text-gray-900 dark:text-gray-100">
                                          {member.userName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                          ₹
                                          {Math.round(
                                            row.amount / row.members.length
                                          ).toLocaleString("en-IN")}
                                        </span>
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs ${
                                            member.paidStatus
                                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                          }`}
                                        >
                                          {member.paidStatus
                                            ? "Paid"
                                            : "Unpaid"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
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
                              </motion.div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold">
                <tr>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    Total
                  </td>
                  <td></td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    ₹
                    {rows
                      .reduce((sum, row) => sum + row.amount, 0)
                      .toLocaleString("en-IN")}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 border-t dark:border-gray-800"
        >
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
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default MyEntries;
