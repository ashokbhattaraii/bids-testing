"use client";
import * as React from "react";

import { useState } from "react";
import { useDonors } from "@/queries/donors";
import { DonorGrid } from "./donor-grid";
import { DonorFilters } from "./donor-filters";
import { NewDonorDialog } from "./new-donor-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { ImportCsvModal } from "./bulk-donor-add";
import type { UploadBulkResponse } from "@/types";

export function DonorsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>("all");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
 const user = JSON.parse(localStorage.getItem("hamro_life_user") || "null");
 const role = user.role;
 
  const { donors, total, isLoading, error, refetch } = useDonors({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    bloodType: bloodTypeFilter !== "all" ? bloodTypeFilter : undefined,
  });

  const stats = {
    total,
    active: donors.filter((d) => d.status === "active").length,
    dormant: donors.filter(
      (d) => d.status === "dormant" || d.status === "do_not_call",
    ).length,
    blacklisted: donors.filter((d) => d.status === "blacklisted").length,
  };

  function handleImportSuccess(_result: UploadBulkResponse) {
    void refetch();
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Donor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage registered blood donors and their availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsNewDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Donor
          </Button>
        {role === "admin" && (
          <Button
            onClick={() => {
              setShowImportModal(true);
              setOpen(false);
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Donor in Bulk
          </Button>)}
        </div>
      </div>
      {/* Filters */}
      <DonorFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        bloodTypeFilter={bloodTypeFilter}
        onBloodTypeChange={setBloodTypeFilter}
      />

      {/* Error state */}
      {error && (
        <p className="text-sm text-destructive text-center py-4">{error}</p>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DonorGrid donors={donors} />
      )}

      {/* New donor dialog */}
      <NewDonorDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onCreated={refetch}
      />

       {showImportModal && (
        <ImportCsvModal
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

    </div>
  );
}
