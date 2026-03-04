"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  fetchRoutes,
  toggleRowSelection,
  selectAllRows,
  deselectAllRows,
} from "@/lib/store/routeSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ColumnHeader } from "./ColumnHeader";

export function RoutesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { routes, selectedRows, loading, error, sortBy, sortOrder, groupBy } =
    useSelector((state: RootState) => state.routes);

  useEffect(() => {
    dispatch(fetchRoutes());
  }, [dispatch]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(selectAllRows());
    } else {
      dispatch(deselectAllRows());
    }
  };

  const handleRowToggle = (id: string) => {
    dispatch(toggleRowSelection(id));
  };

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const isAllSelected = routes.length > 0 && selectedCount === routes.length;
  const isSomeSelected = selectedCount > 0 && selectedCount < routes.length;

  // Process routes with sorting and grouping
  const processedRoutes = useMemo(() => {
    let processed = [...routes];

    // Apply sorting
    if (sortBy) {
      processed.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue < bValue) {
          return sortOrder === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return processed;
  }, [routes, sortBy, sortOrder]);

  // Group routes if groupBy is set
  const groupedRoutes = useMemo(() => {
    if (!groupBy) {
      return [{ group: null, routes: processedRoutes }];
    }

    const groups: Record<string, typeof processedRoutes> = {};
    processedRoutes.forEach((route) => {
      const groupKey = route[groupBy];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(route);
    });

    // Return sorted groups
    return Object.entries(groups).map(([groupKey, groupRoutes]) => ({
      group: groupKey,
      routes: groupRoutes,
    }));
  }, [processedRoutes, groupBy]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Loading routes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected || isSomeSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead>
              <ColumnHeader column="state" label="State" />
            </TableHead>
            <TableHead>
              <ColumnHeader column="suburb" label="Suburb" />
            </TableHead>
            <TableHead>
              <ColumnHeader column="postcode" label="Postcode" />
            </TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedRoutes.flatMap((group) => {
            const rows = [];

            if (groupBy && group.group) {
              rows.push(
                <TableRow
                  key={`group-${group.group}`}
                  className="bg-gray-50 hover:bg-gray-50"
                >
                  <TableCell
                    colSpan={5}
                    className="font-semibold text-sm text-gray-700 py-2"
                  >
                    {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}:{" "}
                    {group.group}
                  </TableCell>
                </TableRow>,
              );
            }

            group.routes.forEach((route) => {
              rows.push(
                <TableRow key={route._id}>
                  <TableCell className="w-12">
                    <Checkbox
                      checked={!!selectedRows[route._id]}
                      onCheckedChange={() => handleRowToggle(route._id)}
                      aria-label={`Select row ${route._id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{route.state}</TableCell>
                  <TableCell>{route.suburb}</TableCell>
                  <TableCell>{route.postcode}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusBadgeColor(route.status ?? "pending")} capitalize`}
                    >
                      {route.status}
                    </Badge>
                  </TableCell>
                </TableRow>,
              );
            });

            return rows;
          })}
        </TableBody>
      </Table>
    </div>
  );
}