
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DocumentAgreementCheckboxProps {
  agreed: boolean;
  onAgreementChange: (checked: boolean) => void;
}

export function DocumentAgreementCheckbox({
  agreed,
  onAgreementChange
}: DocumentAgreementCheckboxProps) {
  return (
    <div className="flex items-start space-x-2 mt-6">
      <Checkbox 
        id="terms" 
        checked={agreed}
        onCheckedChange={(checked) => onAgreementChange(checked === true)}
      />
      <Label htmlFor="terms" className="text-sm leading-normal">
        I confirm that I have read, understood, and agree to all the terms and conditions in these documents. 
        I acknowledge that these documents constitute a legally binding agreement between myself and DreamStream.
        Once submitted, final executed copies will be emailed to me and available for download.
      </Label>
    </div>
  );
}
