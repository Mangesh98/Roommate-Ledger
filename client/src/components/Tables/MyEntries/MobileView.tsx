import { EntryType } from "../../../types/types";
import { formatDate } from "../../../lib/utils";
import { Info, Circle, CircleCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

interface MobileViewProps {
  rows: EntryType[];
}

export const MobileView = ({ rows }: MobileViewProps) => {
  return (
    <div className="space-y-4 p-4">
      {rows.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      ) : (
        <>
          {rows.map((row) => (
            <div
              key={row._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(new Date(row.date))}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white mt-1">
                    {row.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ₹{row.amount.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    (₹
                    {Math.round(row.amount / row.members.length).toLocaleString(
                      "en-IN"
                    )}
                    /person)
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 rounded-md text-sm
                      bg-gray-50 text-gray-700 hover:bg-gray-100 
                      dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/50 
                      transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View Split Details
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[90%] rounded-lg">
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
                  <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
                    Created on{" "}
                    {new Date(row.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          ))}

          {/* Total Section for Mobile */}
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Amount
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₹
                {rows
                  .reduce((sum, row) => sum + row.amount, 0)
                  .toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
