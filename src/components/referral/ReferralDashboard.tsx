
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { createReferralRecord } from '@/utils/ReferralUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ReferralData {
  referralCode: string;
  referralsCount: number;
  successfulReferrals: number;
  totalRewards: number;
  referralHistory: Array<{
    newUserId: string;
    timestamp: Date;
    status: 'pending' | 'completed';
    rewardAmount?: number;
  }>;
}

const ReferralDashboard = () => {
  const { currentUser } = useAuth();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!currentUser) return;
      
      const db = getFirestore();
      const referralDoc = doc(db, 'referrals', currentUser.uid);
      const docSnap = await getDoc(referralDoc);
      
      if (!docSnap.exists()) {
        // Create new referral record if it doesn't exist
        const referralCode = await createReferralRecord(currentUser.uid, currentUser.email || '');
        setReferralData({
          referralCode,
          referralsCount: 0,
          successfulReferrals: 0,
          totalRewards: 0,
          referralHistory: []
        });
      } else {
        setReferralData(docSnap.data() as ReferralData);
      }
      setLoading(false);
    };

    fetchReferralData();
  }, [currentUser]);

  const copyReferralCode = () => {
    if (!referralData?.referralCode) return;
    
    navigator.clipboard.writeText(referralData.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard"
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!referralData) {
    return <div>No referral data available</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Referral Dashboard</h2>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Referral Code</h3>
        <div className="flex items-center gap-4">
          <code className="bg-muted px-4 py-2 rounded">{referralData.referralCode}</code>
          <Button onClick={copyReferralCode} variant="outline">Copy Code</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Referrals</h3>
          <p className="text-3xl font-bold">{referralData.referralsCount}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Successful Referrals</h3>
          <p className="text-3xl font-bold">{referralData.successfulReferrals}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Rewards</h3>
          <p className="text-3xl font-bold">${referralData.totalRewards}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Referral History</h3>
        <div className="space-y-4">
          {referralData.referralHistory.map((referral, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">User: {referral.newUserId}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(referral.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded ${
                  referral.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {referral.status}
                </span>
                {referral.rewardAmount && (
                  <span className="ml-4 text-green-600">+${referral.rewardAmount}</span>
                )}
              </div>
            </div>
          ))}
          {referralData.referralHistory.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No referral history yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
