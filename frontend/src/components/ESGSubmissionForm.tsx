import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

interface DataType {
  value: string;
  label: string;
  description: string;
  units: string[];
}

interface SubmissionResult {
  recordId: number;
  transactionHash: string;
  blockNumber: number;
}

export const ESGSubmissionForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const [formData, setFormData] = useState({
    dataType: "",
    value: "",
    unit: "",
    periodStart: "",
    periodEnd: "",
    comments: "",
  });

  useEffect(() => {
    loadDataTypes();
  }, []);

  const loadDataTypes = async () => {
    try {
      const response = await api.get('/api/esg/data-types');
      setDataTypes(response.data.dataTypes);
    } catch (error) {
      console.error('Failed to load data types:', error);
      toast.error('Failed to load data types');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDataTypeChange = (value: string) => {
    const selectedType = dataTypes.find(dt => dt.value === value);
    setFormData(prev => ({
      ...prev,
      dataType: value,
      unit: selectedType?.units[0] || ''
    }));
  };

  const handleNext = () => {
    if (!formData.dataType || !formData.value || !formData.unit) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      toast.error("Please enter a valid positive number");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const submissionData = {
        dataType: formData.dataType,
        value: formData.value,
        unit: formData.unit,
        comments: formData.comments,
        reportingPeriod: {
          startDate: formData.periodStart || undefined,
          endDate: formData.periodEnd || undefined,
        }
      };

      const response = await api.post('/api/esg/submit', submissionData);
      
      if (response.data.success) {
        setSubmissionResult(response.data.data);
        toast.success("ESG data submitted to blockchain!");
        setStep(3);
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit ESG data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      dataType: "",
      value: "",
      unit: "",
      periodStart: "",
      periodEnd: "",
      comments: "",
    });
    setSubmissionResult(null);
    setStep(1);
  };

  const progress = (step / 3) * 100;
  const selectedDataType = dataTypes.find(dt => dt.value === formData.dataType);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit ESG Data</CardTitle>
        <CardDescription>Record your sustainability metrics on the blockchain</CardDescription>
        <Progress value={progress} className="h-1.5 mt-4" />
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="dataType">Data Type *</Label>
              <Select value={formData.dataType} onValueChange={handleDataTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDataType && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedDataType.description}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="1000"
                  value={formData.value}
                  onChange={(e) => updateField("value", e.target.value)}
                  required
                  min="0"
                  step="any"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => updateField("unit", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDataType?.units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="periodStart">Reporting Period Start</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => updateField("periodStart", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodEnd">Reporting Period End</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => updateField("periodEnd", e.target.value)}
                  min={formData.periodStart}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Any relevant details about this data..."
                value={formData.comments}
                onChange={(e) => updateField("comments", e.target.value)}
                rows={3}
              />
            </div>

            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                <strong>Warning:</strong> Data submitted to the blockchain is permanent and cannot be modified or
                deleted. Please verify all information before submission.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!formData.dataType || !formData.value || !formData.unit}>
                Review Submission
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-lg bg-muted p-6 space-y-4">
              <h3 className="font-semibold text-lg">Review Your Submission</h3>
              <div className="grid gap-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Data Type:</span>
                  <span className="font-medium">{selectedDataType?.label}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">{formData.value} {formData.unit}</span>
                </div>
                {formData.periodStart && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reporting Period:</span>
                    <span className="font-medium">
                      {formData.periodStart} to {formData.periodEnd || 'Present'}
                    </span>
                  </div>
                )}
                {formData.comments && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-1">Comments:</span>
                    <span className="font-medium text-sm">{formData.comments}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <Button variant="outline" onClick={() => setStep(1)} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting to Blockchain..." : "Confirm & Submit"}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && submissionResult && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Successfully Submitted!</h3>
              <p className="text-muted-foreground">Your ESG data has been recorded on the blockchain</p>
            </div>

            <div className="rounded-lg bg-muted p-6 space-y-3 text-left">
              <div className="flex justify-between items-start gap-4">
                <span className="text-muted-foreground">Transaction Hash:</span>
                <span className="blockchain-hash text-xs font-mono break-all text-right">
                  {submissionResult.transactionHash}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Record ID:</span>
                <span className="font-medium">#{submissionResult.recordId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block Number:</span>
                <span className="font-medium">{submissionResult.blockNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <Button onClick={resetForm} className="w-full">
              Submit Another Record
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
