import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Clock, ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { toast } from "sonner";

interface ESGRecord {
  _id: string;
  blockchainRecordId: number;
  dataType: string;
  value: string;
  unit: string;
  submittedAt: string;
  transactionHash: string;
  documentHash: string;
  isVerified: boolean;
  reportingPeriod?: {
    startDate: string;
    endDate: string;
  };
  blockchain?: {
    timestamp: number;
  };
}

export const ESGRecordsTable = () => {
  const [records, setRecords] = useState<ESGRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const response = await api.get('/api/esg/records');
      setRecords(response.data.records);
    } catch (error) {
      console.error('Failed to load records:', error);
      toast.error('Failed to load ESG records');
    } finally {
      setLoading(false);
    }
  };

  const formatDataType = (dataType: string) => {
    return dataType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My ESG Records ({records.length})</CardTitle>
        <CardDescription>View all your blockchain-recorded ESG data submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <Alert>
            <AlertDescription>
              No ESG records found. Submit your first ESG data using the submission form.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Data Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <Collapsible key={record._id} asChild>
                    <>
                      <TableRow>
                        <TableCell className="font-medium">
                          #{record.blockchainRecordId}
                        </TableCell>
                        <TableCell>{formatDataType(record.dataType)}</TableCell>
                        <TableCell>{record.value} {record.unit}</TableCell>
                        <TableCell>
                          {new Date(record.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {record.isVerified ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
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
                          <TableCell colSpan={6} className="bg-muted/50">
                            <div className="p-4 space-y-3">
                              <h4 className="font-semibold text-sm mb-3">Blockchain Details</h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground min-w-32">Transaction Hash:</span>
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="blockchain-hash break-all font-mono text-xs">
                                      {record.transactionHash}
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-6 w-6 flex-shrink-0"
                                      onClick={() => {
                                        navigator.clipboard.writeText(record.transactionHash);
                                        toast.success('Transaction hash copied!');
                                      }}
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-muted-foreground min-w-32">Document Hash:</span>
                                  <span className="blockchain-hash break-all font-mono text-xs">
                                    {record.documentHash}
                                  </span>
                                </div>
                                {record.blockchain?.timestamp && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground min-w-32">Blockchain Time:</span>
                                    <span className="font-medium">
                                      {new Date(record.blockchain.timestamp * 1000).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {record.reportingPeriod?.startDate && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-muted-foreground min-w-32">Reporting Period:</span>
                                    <span className="font-medium">
                                      {new Date(record.reportingPeriod.startDate).toLocaleDateString()} 
                                      {' - '}
                                      {record.reportingPeriod.endDate 
                                        ? new Date(record.reportingPeriod.endDate).toLocaleDateString()
                                        : 'Present'
                                      }
                                    </span>
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
        )}
      </CardContent>
    </Card>
  );
};
