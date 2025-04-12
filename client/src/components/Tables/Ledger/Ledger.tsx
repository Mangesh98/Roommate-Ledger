import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { EntryType, LedgerType } from "../../../types/types";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Skeleton } from "../../ui/skeleton";
import { Circle, CircleCheck, Info } from "lucide-react";
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
import { getAssociatedEntriesAction, getLedger } from "../../../api/ledger";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [name, setName] = useState("Name");
  const [cookies] = useCookies();
  const token = cookies.token;
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const [memberId, setMemberId] = useState<null | string>(null);

  async function fetchLedgerEntries() {
    setLoading(true);
    try {
      const response = await getLedger(token);
      // console.log(response);

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
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchLedgerEntries();
  }, []);

  const fetchAssociatedEntries = async (page: number, memberId: string) => {
    setLoading(true);
    setShow(false);
    try {
      const result = await getAssociatedEntriesAction(
        page,
        pageLimit,
        token,
        memberId
      );
      // console.log("Ledger Associated ", result, show);
      if (result.data) {
        const member = result.data[0].members.find(
          (member: Member) => member.userId === memberId
        );
        // console.log(member);

        setName(member?.userName || "Name");
        setShow(true);
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

  const handlePaginationClick = (page: number) => {
    if (memberId) {
      fetchAssociatedEntries(page, memberId);
    }
  };

  function viewEntries(userId: string) {
    setMemberId(userId);
    fetchAssociatedEntries(1, userId);
  }

  if (loading) {
    return (
      <div className="relative w-full overflow-auto">
        <h2 className="mb-2">Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto min-w-max">
            <thead className="text-sm font-medium text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-800">
              <tr className="border-b">
                {["Name", "Payable", "Receivable", "Total"].map(
                  (_header, index) => (
                    <th key={index} scope="col" className="px-6 py-3 text-left">
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
      </div>
    );
  }
  return (
    <div>
     
      <div className="rounded-lg border shadow-sm bg-white dark:bg-gray-900">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Ledger Overview</h2>
        </div>
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
              {ledgers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                ledgers.flatMap((ledger) =>
                  ledger.members.map((member) => {
                    const balance = member.receivable - member.payable;
                    return (
                      <tr
                        key={member._id}
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
                      </tr>
                    );
                  })
                )
              )}
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
      </div>
	  {show && (
  <div className="mt-8 rounded-lg border shadow-sm bg-white dark:bg-gray-900">
    <div className="p-4 border-b flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold">{name}'s Transactions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Detailed transaction history
        </p>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300">
              Date
            </th>
            <th scope="col" className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300">
              Paid By
            </th>
            <th scope="col" className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300">
              Description
            </th>
            <th scope="col" className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300">
              Amount
            </th>
            <th scope="col" className="px-6 py-4 text-left font-medium text-gray-600 dark:text-gray-300">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
                  {row.members.find((member) => member.userId === row.paidBy)?.userName || "Unknown"}
                </td>
                <td className="px-6 py-4 text-sm">{row.description}</td>
                <td className={`px-6 py-4 text-sm font-medium ${
                  row.paidBy === currentUser?.userId 
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  ₹{row.amount.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center px-3 py-1 rounded-md text-sm
                        bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 
                        dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                        <Info className="w-4 h-4 mr-1" />
                        View Split
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <span>Split Details</span>
                          <span className="text-sm font-normal text-gray-500">
                            (₹{row.amount.toLocaleString('en-IN')})
                          </span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        {row.members.map((member, idx) => (
                          <div key={idx} 
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              member.paidStatus 
                                ? 'bg-green-50 dark:bg-green-900/20' 
                                : 'bg-gray-50 dark:bg-gray-800'
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
                              ₹{Math.round(row.amount / row.members.length).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                      <DialogDescription className="text-sm text-gray-500 pt-2 border-t">
                        Created on {new Date(row.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </DialogDescription>
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
              ₹{rows.reduce((sum, row) => sum + row.amount, 0).toLocaleString('en-IN')}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div className="p-4 border-t">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) handlePaginationClick(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                if (currentPage < totalPages) handlePaginationClick(currentPage + 1);
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
)}
    </div>
  );
};

export default Ledger;
