'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setSortBy, setGroupBy } from '@/lib/store/routeSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

interface ColumnHeaderProps {
  column: 'state' | 'suburb' | 'postcode';
  label: string;
}

export function ColumnHeader({ column, label }: ColumnHeaderProps) {
  const dispatch = useDispatch();
  const { sortBy, sortOrder, groupBy } = useSelector((state: RootState) => state.routes);

  const isSorted = sortBy === column;
  const isGrouped = groupBy === column;

  return (
    <DropdownMenu>
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 p-1 hover:bg-gray-100 flex items-center gap-1 w-full justify-start"
        >
          <span>{label}</span>
          {isSorted && (
            sortOrder === 'asc' ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )
          )}
          {!isSorted && (
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider">
          Sort
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => dispatch(setSortBy(column))}>
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1">Sort by {label}</div>
            {isSorted && (
              <span className="text-xs text-blue-600">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch(setSortBy(null))}>
          Clear Sort
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs uppercase tracking-wider">
          Group
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={isGrouped}
          onCheckedChange={(checked) => {
            dispatch(setGroupBy(checked ? column : null));
          }}
        >
          Group by {label}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}