"use client";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { updateRoutesStatus } from "@/lib/store/routeSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export function StatusMenu() {
  const dispatch = useDispatch<AppDispatch>();
  const routes = useSelector((state: RootState) => state.routes.routes);
  const selectedRows = useSelector(
    (state: RootState) => state.routes.selectedRows,
  );
  const updating = useSelector((state: RootState) => state.routes.updating);

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const isDisabled = selectedCount === 0 || updating;

  const handleStatusChange = (newStatus: "pending" | "done" | "failed") => {
    dispatch(
      updateRoutesStatus({
        selectedIds: Object.keys(selectedRows)
          .filter((id) => selectedRows[id])
          .map((id) => routes.find((route) => route._id === id)!),
        newStatus,
      }),
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600">
        {selectedCount > 0 ? `${selectedCount} selected` : "No selection"}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={isDisabled}
            className="flex items-center gap-1"
          >
            Update Status
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusChange("pending")}
            disabled={updating}
          >
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange("done")}
            disabled={updating}
          >
            Done
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChange("failed")}
            disabled={updating}
          >
            Failed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {updating && <span className="text-xs text-gray-500">Updating...</span>}
    </div>
  );
}