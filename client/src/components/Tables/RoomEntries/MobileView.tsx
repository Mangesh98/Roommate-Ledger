import { EntryType } from "../../../types/types";
import { formatDate } from "../../../lib/utils";
import { HandCoins, Info, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../../ui/dialog";

interface MobileViewProps {
  rows: EntryType[];
  currentUser: any;
  handleUpdateEntry: (row: EntryType) => void;
  handleDeleteClick: (id: string) => void;
}

export const MobileView = ({
  rows,
  currentUser,
  handleUpdateEntry,
  handleDeleteClick,
}: MobileViewProps) => {
  return (
    <div className="space-y-4 p-4">
      {/* Mobile Friendly Filter Section */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Your existing filter components with mobile-specific styling */}
        </div>
      </div>

      {/* Entries List */}
      {rows.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      ) : (
        rows.map((row) => (
          <div
            key={row._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {
                    row.members.find((member) => member.userId === row.paidBy)
                      ?.userName
                  }
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(new Date(row.date))}
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

            <div className="text-sm text-gray-700 dark:text-gray-300">
              {row.description}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-gray-700">
              <div className="flex-1">
                {(() => {
                  const currentUserMember = row.members.find(
                    (member) => member.userId === currentUser.userId
                  );
                  if (currentUserMember?.isPending) {
                    return (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                        Pending
                      </span>
                    );
                  } else if (currentUserMember?.paidStatus) {
                    return (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        Paid
                      </span>
                    );
                  } else if( currentUserMember && !currentUserMember.paidStatus) {
                    return (
                      <button
                        onClick={() => handleUpdateEntry(row)}
                        className="inline-flex items-center px-3 py-1.5 rounded-md text-sm
                          bg-blue-50 text-blue-700 hover:bg-blue-100 
                          dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 
                          transition-colors"
                      >
                        <HandCoins className="w-4 h-4 mr-1.5" />
                        Pay ₹
                        {Math.round(
                          row.amount / row.members.length
                        ).toLocaleString("en-IN")}
                      </button>
                    );
                  }
                })()}
              </div>

              <div className="flex items-center gap-2">
                {row.paidBy === currentUser.userId &&
                  row.members.filter(
                    (member) =>
                      member.paidStatus && member.userId !== currentUser.userId
                  ).length === 0 && (
                    <button
                      onClick={() => handleDeleteClick(row._id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                <Dialog>
                  <DialogTrigger>
                    <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                      <Info className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="w-[90%] rounded-lg">
                    <DialogHeader>
                      <DialogTitle>Split Details</DialogTitle>
                      <DialogDescription>
                        Total Amount: ₹{row.amount.toLocaleString("en-IN")}
                      </DialogDescription>
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
                            <span>{member.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
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
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
