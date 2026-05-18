"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Star,
  MoreVertical,
  CheckCircle,
  Ban,
  Edit,
  Loader2,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateDonor, useBlacklistDonor } from "@/queries/donors";
import { useToast } from "@/hooks/use-toast";
import { EditDonorDialog } from "./edit-donor-dialog";
import type { Donor } from "@/types";

interface DonorGridProps {
  donors: Donor[];
}

const statusColor = (status: Donor["status"]): string => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-300";
    case "pledged":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "blacklisted":
      return "bg-red-100 text-red-700 border-red-300";
    case "dormant":
      return "bg-slate-100 text-slate-700 border-slate-300";
    case "do_not_call":
      return "bg-orange-100 text-orange-700 border-orange-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

export function DonorGrid({ donors }: DonorGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [remarkValue, setRemarkValue] = useState("");
  const [editDialogDonor, setEditDialogDonor] = useState<Donor | null>(null);
  const { updateDonor, isUpdating } = useUpdateDonor();
  const { blacklist, unblacklist } = useBlacklistDonor();
  const { toast } = useToast();

  const startEdit = useCallback((donor: Donor) => {
    setEditingId(donor.id);
    setRemarkValue(donor.notes ?? "");
  }, []);

  const saveRemark = useCallback(
    async (donor: Donor) => {
      if (remarkValue === (donor.notes ?? "")) {
        setEditingId(null);
        return;
      }
      setEditingId(null);
      await updateDonor({ id: donor.id, input: { notes: remarkValue || undefined } });
    },
    [remarkValue, updateDonor],
  );

  const formatLastDonation = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const diffDays = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return "1 month ago";
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const isEligible = (lastDonation: string | null) => {
    if (!lastDonation) return true;
    const diffDays = Math.floor(
      (Date.now() - new Date(lastDonation).getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays >= 56;
  };

  const handleBlacklist = async (id: string) => {
    await blacklist({ id, reason: 'Manual blacklist' });
    toast({ title: 'Donor blacklisted' });
  };

  const handleUnblacklist = async (id: string) => {
    await unblacklist(id);
    toast({ title: 'Donor removed from blacklist' });
  };

  const handleActivate = async (id: string) => {
    await updateDonor({ id, input: { status: 'active' } });
    toast({ title: 'Donor activated successfully' });
  };

  const user = JSON.parse(localStorage.getItem("hamro_life_user") || "{}");
  const role = user.role;

  if (donors.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>No donors found matching your criteria</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Blood Type</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold text-center">
                Donations
              </TableHead>
              <TableHead className="font-semibold text-center">
                Rating
              </TableHead>
              <TableHead className="font-semibold">Last Donation</TableHead>
              <TableHead className="font-semibold">Eligibility</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Remarks</TableHead>
              {role === "admin" && (
                <TableHead className="font-semibold text-center">
                  Action
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {donors.map((donor) => (
              <TableRow
                key={donor.id}
                className={cn(
                  "hover:bg-muted/30 transition-colors",
                  donor.status === "blacklisted" && "opacity-60 bg-red-50/30",
                )}
              >
                <TableCell className="font-medium">{donor.name}</TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 font-semibold"
                  >
                    {donor.bloodType}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs gap-1"
                    // onClick={() => window.open(`tel:${donor.phone}`, "_self")}
                  >
                    <Phone className="h-3 w-3" />
                    {donor.phone}
                  </Button>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {donor.location}
                </TableCell>

                <TableCell className="text-center font-medium">
                  {donor.donationCount}
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">
                      {donor.rating.toFixed(1)}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {formatLastDonation(donor.lastDonation)}
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      isEligible(donor.lastDonation)
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-amber-100 text-amber-700 border-amber-200",
                    )}
                  >
                    {isEligible(donor.lastDonation)
                      ? "Eligible"
                      : "Not Eligible"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      statusColor(donor.status),
                    )}
                  >
                    {donor.status.replace("_", " ")}
                  </Badge>
                </TableCell>

                {/* Remarks — inline editable */}
                <TableCell className="w-50 min-w-40 max-w-50">
                  {editingId === donor.id ? (
                    <Textarea
                      autoFocus
                      rows={3}
                      className="text-xs resize-none w-full"
                      value={remarkValue}
                      onChange={(e) => setRemarkValue(e.target.value)}
                      onBlur={() => saveRemark(donor)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void saveRemark(donor);
                        }
                        if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className={cn(
                        "w-full text-left text-xs rounded px-2 py-1 transition-colors",
                        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        donor.notes
                          ? "text-foreground"
                          : "text-muted-foreground/60 italic",
                      )}
                      onClick={() => startEdit(donor)}
                      title={donor.notes ?? 'Click to add remark'}
                    >
                      {isUpdating ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Saving…
                        </span>
                      ) : donor.notes ? (
                        <span className="block whitespace-normal wrap-break-word line-clamp-3">
                          {donor.notes}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Add remark
                        </span>
                      )}
                    </button>
                  )}
                </TableCell>

               {role === 'admin' && (
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditDialogDonor(donor)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      {donor.status !== 'active' && donor.status !== 'blacklisted' && (
                        <DropdownMenuItem onClick={() => handleActivate(donor.id)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate Donor
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {donor.status === "blacklisted" ? (
                        <DropdownMenuItem
                          onClick={() => handleUnblacklist(donor.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Remove from Blacklist
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleBlacklist(donor.id)}
                          className="text-destructive"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Blacklist Donor
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <EditDonorDialog
      donor={editDialogDonor}
      open={editDialogDonor !== null}
      onOpenChange={(o) => { if (!o) setEditDialogDonor(null); }}
    />
    </>
  );
}
