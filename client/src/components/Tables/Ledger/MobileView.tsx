import { LedgerType, EntryType } from "../../../types/types";
import { formatDate } from "../../../lib/utils";
import { Info, Circle, CircleCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";

interface MobileViewProps {
  ledgers: LedgerType[];
  viewEntries: (userId: string) => void;
  associatedEntries?: {
    rows: EntryType[];
    name: string;
    show: boolean;
  };
  currentUser?: any;
  entriesLoading: boolean;
}

export const MobileView = ({
  ledgers,
  viewEntries,
  associatedEntries,
  currentUser,
  entriesLoading,
}: MobileViewProps) => {
  const associatedEntriesRef = useRef<HTMLDivElement>(null);

  const handleViewTransactions = (userId: string) => {
    viewEntries(userId);
  };

  useEffect(() => {
    if (associatedEntries?.show && !entriesLoading) {
      setTimeout(() => {
        associatedEntriesRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [associatedEntries?.show, entriesLoading]);

  return (
    <div className="space-y-6 p-4">
      {/* Ledger Cards */}
      <div className="space-y-4">
        <AnimatePresence>
          {ledgers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400"
            >
              No transactions found
            </motion.div>
          ) : (
            ledgers.flatMap((ledger) =>
              ledger.members.map((member, index) => {
                const balance = member.receivable - member.payable;
                return (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.userName}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Payable
                        </div>
                        <div className="font-medium text-red-600 dark:text-red-400">
                          ₹{member.payable.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Receivable
                        </div>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          ₹{member.receivable.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div
                        className={`text-sm font-medium ${
                          balance >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        ₹{Math.abs(balance).toLocaleString("en-IN")}
                        <span className="text-xs ml-1">
                          {balance >= 0 ? "(to receive)" : "(to pay)"}
                        </span>
                      </div>
                    </div>

                    {Math.abs(balance) > 0 && (
                      <button
                        onClick={() => handleViewTransactions(member.userId)}
                        className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm
                          bg-blue-50 text-blue-700 hover:bg-blue-100 
                          dark:bg-blue-900/30 dark:text-blue-400 
                          dark:hover:bg-blue-900/50 transition-colors
                          border border-blue-200 dark:border-blue-800"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        View Transactions
                      </button>
                    )}
                  </motion.div>
                );
              })
            )
          )}
        </AnimatePresence>
      </div>

      {/* Associated Entries Section */}
      <AnimatePresence mode="wait">
        {associatedEntries?.show && (
          <motion.div
            ref={associatedEntriesRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { duration: 0.3 },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: { duration: 0.2 },
            }}
            className="space-y-4 mt-8"
          >
            {entriesLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg h-32 animate-pulse"
                  />
                ))}
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b pb-4 dark:border-gray-700"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {associatedEntries.name}'s Transactions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Transaction history
                  </p>
                </motion.div>

                <AnimatePresence>
                  {associatedEntries.rows.map((row, index) => (
                    <motion.div
                      key={row._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(new Date(row.date))}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white mt-1">
                            {row.description}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Paid by:{" "}
                            {
                              row.members.find(
                                (member) => member.userId === row.paidBy
                              )?.userName
                            }
                          </div>
                        </div>
                        <div
                          className={`text-right font-medium ${
                            row.paidBy === currentUser?.userId
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          ₹{row.amount.toLocaleString("en-IN")}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm
                        bg-gray-50 text-gray-700 hover:bg-gray-100 
                        dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 
                        transition-colors border border-gray-200 dark:border-gray-700"
                          >
                            <Info className="w-4 h-4 mr-2" />
                            View Split Details
                          </button>
                        </DialogTrigger>
                        <DialogContent className="w-[90%] rounded-lg">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
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
                                      {member.paidStatus ? "Paid" : "Unpaid"}
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
                          </motion.div>
                        </DialogContent>
                      </Dialog>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
