import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Timer, ChevronDown, ExternalLink, XCircle, Edit3 } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerifierRecord {
  _id: string;
  blockchainRecordId: number;
  dataType: string;
  value: string;
  unit: string;
  submittedAt: string;
  transactionHash: string;
  documentHash: string;
  isVerified: boolean;
  verifierComments?: string;
  companyName?: string;
  reportingPeriod?: {
    startDate: string;
    endDate: string;
  };
  blockchain?: {
    timestamp: number;
  };
}

export function VerifierRecordsTable({ mode }: { mode: "pending" | "all" }) {
  const [records, setRecords] = useState<VerifierRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<VerifierRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    loadRecords();
  }, [mode]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const endpoint = mode === "pending" ? "/api/verification/pending" : "/api/verification/all";
      const response = await api.get(endpoint);
      setRecords(response.data.records);
    } catch (error) {
      toast.error(`Failed to load ${mode === "pending" ? "pending" : "all"} records`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rec: VerifierRecord, action: 'approve' | 'reject') => {
    setSelected(rec);
    setAction(action);
    setDialogOpen(true);
    setComments("");
  };

  const handleVerify = async () => {
    if (!selected || !action) return;
    setVerifying(true);
    try {
      const res = await api.post(`/api/verification/verify/${selected.blockchainRecordId}`, {
        approved: action === "approve",
        comments,
      });
      toast.success(res.data.message || "Record updated");
      setDialogOpen(false);
      loadRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const formatDataType = (dataType: string) =>
    dataType
      .split("_")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!records.length) {
    return (
      <Card>
        <CardContent>
          <Alert>
            <AlertDescription>
              {mode === "pending"
                ? "No pending records for verification."
                : "No ESG records found for verification."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map(rec => (
                  <Collapsible key={rec._id} asChild>
                    <>
                      <TableRow>
                        <TableCell className="font-medium">
                          #{rec.blockchainRecordId}
                        </TableCell>
                        <TableCell>
                          {rec.companyName || "N/A"}
                        </TableCell>
                        <TableCell>{formatDataType(rec.dataType)}</TableCell>
                        <TableCell>{rec.value} {rec.unit}</TableCell>
                        <TableCell>
                          {new Date(rec.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {rec.isVerified ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700">
                              <Timer className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!rec.isVerified && (
                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                variant="success"
                                onClick={() => handleOpenDialog(rec, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="xs"
                                variant="destructive"
                                onClick={() => handleOpenDialog(rec, 'reject')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {rec.isVerified && rec.verifierComments && (
                            <Badge variant="outline" className="text-[11px]">
                              <Edit3 className="mr-1 h-3 w-3" />
                              Comments
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={8} className="bg-muted/50">
                            <div className="p-4 space-y-3">
                              <h4 className="font-semibold text-sm mb-3">Blockchain/Verifier Details</h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground min-w-32">Transaction Hash:</span>
                                  <span className="blockchain-hash break-all font-mono text-xs">
                                    {rec.transactionHash}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => {
                                      navigator.clipboard.writeText(rec.transactionHash);
                                      toast.success("Transaction hash copied!");
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground min-w-32">Document Hash:</span>
                                  <span className="blockchain-hash break-all font-mono text-xs">
                                    {rec.documentHash}
                                  </span>
                                </div>
                                {rec.reportingPeriod?.startDate && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground min-w-32">Reporting Period:</span>
                                    <span className="font-medium">
                                      {new Date(rec.reportingPeriod.startDate).toLocaleDateString()} 
                                      {' - '}
                                      {rec.reportingPeriod.endDate 
                                        ? new Date(rec.reportingPeriod.endDate).toLocaleDateString()
                                        : 'Present'
                                      }
                                    </span>
                                  </div>
                                )}
                                {rec.blockchain?.timestamp && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground min-w-32">Blockchain Time:</span>
                                    <span className="font-medium">
                                      {new Date(rec.blockchain.timestamp * 1000).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {rec.verifierComments && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground min-w-32">Verifier Comments:</span>
                                    <span className="font-medium">{rec.verifierComments}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* VERIFY/REJECT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve"
                ? "Approve ESG Record"
                : action === "reject"
                ? "Reject ESG Record"
                : "Verify ESG Record"}
            </DialogTitle>
          </DialogHeader>
          <div className="my-3">
            <div className="space-y-2">
              <Label>ESG Data Record</Label>
              <div className="rounded bg-muted p-3 flex flex-col gap-1 text-sm">
                <span>
                  <span className="font-semibold">Type:</span> {formatDataType(selected?.dataType || "")}
                </span>
                <span>
                  <span className="font-semibold">Value:</span> {selected?.value} {selected?.unit}
                </span>
                <span>
                  <span className="font-semibold">Company:</span> {selected?.companyName || "N/A"}
                </span>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label>
                {action === "approve"
                  ? "Optional comment for company"
                  : "Reason for rejection (required)"}
              </Label>
              <Textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
                placeholder={
                  action === "approve"
                    ? "This record is verified and accurate."
                    : "Explain why this submission is rejected..."
                }
                required={action === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={verifying}>
              Cancel
            </Button>
            {action === "reject" && (
              <Button
                variant="destructive"
                onClick={handleVerify}
                disabled={verifying || !comments.trim()}
              >
                {verifying && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                Reject Record
              </Button>
            )}
            {action === "approve" && (
              <Button
                variant="success"
                onClick={handleVerify}
                disabled={verifying}
              >
                {verifying && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                Approve Record
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
