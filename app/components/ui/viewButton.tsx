"use client"
import { setFolderMusicViewMode } from "@/app/lib/local/redux/reduxSclice";
import { useAppDispatch } from "@/app/lib/local/redux/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, List, Rows3, GanttChartSquare } from "lucide-react";

export function ViewButton() {
  const dispatch = useAppDispatch()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1 border border-transparent hover:bg-accent hover:text-accent-foreground hover:border-border rounded"
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            View
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>View options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span>Details</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <Rows3 className="h-4 w-4" />
          <span onClick={()=> dispatch(setFolderMusicViewMode("list"))}>List</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span onClick={()=> dispatch(setFolderMusicViewMode("grid"))}>Tiles</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <GanttChartSquare className="h-4 w-4" />
          <span>Content</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}