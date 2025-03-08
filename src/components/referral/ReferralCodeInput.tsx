
import { useState } from 'react';
import { trackReferral } from '@/utils/ReferralUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ReferralCodeInput = () => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to use a referral code"
      });
      return;
    }

    setLoading(true);
    try {
      await trackReferral(referralCode, currentUser.uid);
      toast({
        title: "Success!",
        description: "Referral code applied successfully"
      });
      setReferralCode('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid referral code or error applying it"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
        placeholder="Enter referral code"
        className="max-w-xs"
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Applying...' : 'Apply Code'}
      </Button>
    </form>
  );
};

export default ReferralCodeInput;
