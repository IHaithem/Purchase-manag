// components/stuff/stuff-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddStuffDialog } from "./add-stuff-dialog";
import { IUser } from "@/store/user.store";

export function StuffHeader({
  searchQuery,
  onSearchChange,
  addNewStuff,
}: {
  searchQuery: string;
  onSearchChange: (search: string) => void;
  addNewStuff: (newStuff: IUser) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Stuff
          </h1>
          <p className="text-muted-foreground">Manage your stuff inventory</p>
        </div>
        <AddStuffDialog addNewStuff={addNewStuff} />
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stuff..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
}
