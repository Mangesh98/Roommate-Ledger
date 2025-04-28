import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { EntryType, LedgerType } from "../../../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Skeleton } from "../../ui/skeleton";
import {
  Circle,
  CircleCheck,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "../../../lib/utils";
import { Button } from "../../ui/button";
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
import { getAssociatedEntriesAction, getLedger } from "../../../api/ledger";
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

interface Member {
  paidStatus: boolean;
  userId: string;
  userName: string;
  _id: string;
}

const Ledger = () => {
  const pageLimit: number = 10;
  const [ledgers, setLedgers] = useState<LedgerType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [rows, setRows] = useState<EntryType[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [name, setName] = useState("Name");
  const [cookies] = useCookies();
  const token = cookies.token;
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [memberId, setMemberId] = useState<null | string>(null);
  const { isMobile } = useBreakpoint();
  const [ledgerLoading, setLedgerLoading] = useState<boolean>(false);
  const [entriesLoading, setEntriesLoading] = useState<boolean>(false);

  async function fetchLedgerEntries() {
    setLedgerLoading(true);
    try {
      const response = await getLedger(token);
      const filteredLedgers = response.data.map((ledger: LedgerType) => ({
        ...ledger,
        members: ledger.members.filter(
          (member) => member.userId !== currentUser.userId
        ),
      }));
      setLedgers(filteredLedgers);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLedgerLoading(false);
    }
  }

  useEffect(() => {
    fetchLedgerEntries();
  }, []);

  const fetchAssociatedEntries = async (page: number, memberId: string) => {
    setEntriesLoading(true);
    try {
      const result = await getAssociatedEntriesAction(
        page,
        pageLimit,
        token,
        memberId
      );
      if (result.data) {
        const member = result.data[0].members.find(
          (member: Member) => member.userId === memberId
        );
        setName(member?.userName || "Name");
        setRows(result.data);
        setCurrentPage(page);
        setTotalPages(result.pagination.totalPages);
        setShow(true);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setEntriesLoading(false);
    }
  };

  const handlePaginationClick = (page: number) => {
    if (memberId) {
      fetchAssociatedEntries(page, memberId);
    }
  };

  function viewEntries(userId: string) {
    setMemberId(userId);
    fetchAssociatedEntries(1, userId);
  }

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border shadow-sm bg-white dark:bg-gray-900"
      >
        {ledgerLoading ? (
          <motion.div
            variants={skeletonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="relative w-full overflow-auto"
          >
            <h2 className="mb-2">Ledger</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-max">
                <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
                  <tr className="border-b">
                    {["Name", "Payable", "Receivable", "Total"].map(
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
          </motion.div>
        ) : isMobile ? (
          <MobileView
            ledgers={ledgers}
            viewEntries={viewEntries}
            associatedEntries={
              show
                ? {
                    rows,
                    name,
                    show,
                  }
                : undefined
            }
            currentUser={currentUser}
            entriesLoading={entriesLoading}
          />
        ) : (
          <AnimatePresence mode="wait">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
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
                      Payable
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                    >
                      Receivable
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300"
                    >
                      Balance
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
                  <AnimatePresence>
                    {ledgers.length === 0 ? (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No transactions found
                        </td>
                      </motion.tr>
                    ) : (
                      ledgers.flatMap((ledger) =>
                        ledger.members.map((member, index) => {
                          const balance = member.receivable - member.payable;
                          return (
                            <motion.tr
                              key={member._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                              }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap font-medium">
                                {member.userName}
                              </td>
                              <td className="px-6 py-4 text-red-600 dark:text-red-400">
                                ₹{member.payable.toLocaleString("en-IN")}
                              </td>
                              <td className="px-6 py-4 text-green-600 dark:text-green-400">
                                ₹{member.receivable.toLocaleString("en-IN")}
                              </td>
                              <td
                                className={`px-6 py-4 font-medium ${
                                  balance >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                ₹{Math.abs(balance).toLocaleString("en-IN")}
                                <span className="text-xs ml-1">
                                  {balance >= 0 ? "(to receive)" : "(to pay)"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {Math.abs(balance) > 0 && (
                                  <button
                                    onClick={() => viewEntries(member.userId)}
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm
                          bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 
                          dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                  >
                                    <Info className="w-4 h-4 mr-1" />
                                    Details
                                  </button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })
                      )
                    )}
                  </AnimatePresence>
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold">
                  <tr>
                    <td className="px-6 py-4">Total</td>
                    <td className="px-6 py-4 text-red-600">
                      ₹
                      {ledgers
                        .reduce(
                          (sum, ledger) =>
                            sum +
                            ledger.members.reduce(
                              (memSum, member) => memSum + member.payable,
                              0
                            ),
                          0
                        )
                        .toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-green-600">
                      ₹
                      {ledgers
                        .reduce(
                          (sum, ledger) =>
                            sum +
                            ledger.members.reduce(
                              (memSum, member) => memSum + member.receivable,
                              0
                            ),
                          0
                        )
                        .toLocaleString("en-IN")}
                    </td>
                    <td colSpan={2} className="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {!isMobile && show && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 rounded-lg border shadow-sm bg-white dark:bg-gray-900"
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {name}'s Transactions
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Detailed transaction history
                    </p>
                  </div>
                </div>
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
                          Paid By
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
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
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
                            <td className="px-6 py-4 text-sm">
                              {row.description}
                            </td>
                            <td
                              className={`px-6 py-4 text-sm font-medium ${
                                row.paidBy === currentUser?.userId
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              ₹{row.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    className="inline-flex items-center px-3 py-1 rounded-md text-sm
                                      bg-gray-50 text-gray-700 hover:bg-gray-100 
                                      dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 
                                      transition-colors"
                                  >
                                    <Info className="w-4 h-4 mr-1" />
                                    View Split
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
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
                                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 dark:text-gray-400">
                                        Total Amount
                                      </span>
                                      <span className="font-medium text-gray-900 dark:text-gray-100">
                                        ₹{row.amount.toLocaleString("en-IN")}
                                      </span>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-800 font-medium">
                      <tr>
                        <td className="px-6 py-4">Total</td>
                        <td colSpan={2}></td>
                        <td className="px-6 py-4">
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

                <div className="w-full mt-4">
                  <Pagination>
                    <PaginationContent className="flex flex-wrap items-center justify-center gap-2">
                      {/* Previous Button */}
                      <PaginationItem className="hidden sm:block">
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1)
                              handlePaginationClick(currentPage - 1);
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>

                      {/* Mobile Previous Button */}
                      <PaginationItem className="sm:hidden">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (currentPage > 1)
                              handlePaginationClick(currentPage - 1);
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
                            {getPaginationPages(currentPage, totalPages)[0] >
                              2 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                          </>
                        )}

                        {/* Page numbers */}
                        {getPaginationPages(currentPage, totalPages).map(
                          (page) => (
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
                          )
                        )}

                        {/* Last page when not in range */}
                        {getPaginationPages(currentPage, totalPages).slice(
                          -1
                        )[0] < totalPages && (
                          <>
                            {getPaginationPages(currentPage, totalPages).slice(
                              -1
                            )[0] <
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
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Ledger;
