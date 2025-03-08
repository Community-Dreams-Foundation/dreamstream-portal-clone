
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment,
  collection,
  query,
  where,
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { useNotifications } from '@/contexts/NotificationContext';

export const generateReferralCode = (userId: string): string => {
  // Generate a unique referral code using user ID and random characters
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${userId.substring(0, 4)}-${randomChars}`;
};

export const createReferralRecord = async (userId: string, userEmail: string) => {
  const db = getFirestore();
  const referralCode = generateReferralCode(userId);
  
  await setDoc(doc(db, 'referrals', userId), {
    userId,
    userEmail,
    referralCode,
    referralsCount: 0,
    paidReferrals: 0,
    rewardsEarned: [],
    createdAt: new Date(),
    referralHistory: []
  });
  
  return referralCode;
};

export const trackReferral = async (referralCode: string, newUserId: string) => {
  const db = getFirestore();
  
  // Find the referrer's document using the referral code
  const referralsRef = collection(db, 'referrals');
  const q = query(referralsRef, where('referralCode', '==', referralCode));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    throw new Error('Invalid referral code');
  }

  const referrerDoc = querySnapshot.docs[0];
  const referrerId = referrerDoc.id;

  // Update referrer's statistics
  await updateDoc(doc(db, 'referrals', referrerId), {
    referralsCount: increment(1),
    referralHistory: arrayUnion({
      newUserId,
      timestamp: new Date(),
      status: 'pending'
    })
  });
};

export const updateReferralStatus = async (referrerId: string, newUserId: string, status: 'paid' | 'cancelled') => {
  const db = getFirestore();
  const referralDoc = await getDoc(doc(db, 'referrals', referrerId));
  
  if (!referralDoc.exists()) return;
  
  const data = referralDoc.data();
  const paidReferrals = status === 'paid' ? data.paidReferrals + 1 : data.paidReferrals;
  
  await updateDoc(doc(db, 'referrals', referrerId), {
    paidReferrals,
    'referralHistory': data.referralHistory.map((ref: any) => 
      ref.newUserId === newUserId ? { ...ref, status } : ref
    )
  });

  if (status === 'paid') {
    await checkAndApplyReferralRewards(referrerId, paidReferrals);
  }
};

export const checkAndApplyReferralRewards = async (userId: string, paidReferralsCount: number) => {
  const db = getFirestore();
  const referralDoc = await getDoc(doc(db, 'referrals', userId));
  const { addNotification } = useNotifications();
  
  if (!referralDoc.exists()) return;
  
  const data = referralDoc.data();
  const earnedRewards = data.rewardsEarned || [];
  let newReward = null;

  // Check for new reward thresholds
  if (paidReferralsCount >= 10 && !earnedRewards.includes('leadership_waiver')) {
    newReward = {
      type: 'leadership_waiver',
      description: 'Leadership Waiver - No fee payment due'
    };
  } else if (paidReferralsCount >= 5 && !earnedRewards.includes('three_months_free')) {
    newReward = {
      type: 'three_months_free',
      description: '3 Months Free Subscription'
    };
  } else if (paidReferralsCount >= 3 && !earnedRewards.includes('one_month_free')) {
    newReward = {
      type: 'one_month_free',
      description: '1 Month Free Subscription'
    };
  }

  if (newReward) {
    // Update referral document with new reward
    await updateDoc(doc(db, 'referrals', userId), {
      rewardsEarned: arrayUnion(newReward.type)
    });

    // Apply the reward to the subscription
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    if (subscriptionDoc.exists()) {
      const subscriptionData = subscriptionDoc.data();
      const currentDueDate = new Date(subscriptionData.dueDate);
      
      if (newReward.type === 'leadership_waiver') {
        await updateDoc(doc(db, 'subscriptions', userId), {
          status: 'waived',
          leadershipWaiver: true
        });
      } else {
        // Add free months to the due date
        const monthsToAdd = newReward.type === 'three_months_free' ? 3 : 1;
        currentDueDate.setMonth(currentDueDate.getMonth() + monthsToAdd);
        
        await updateDoc(doc(db, 'subscriptions', userId), {
          dueDate: currentDueDate.toISOString()
        });
      }
    }

    // Send notification to user about the reward
    await addNotification({
      title: 'Referral Reward Earned!',
      message: `Congratulations! You've earned: ${newReward.description}`,
      type: 'payment',
      metadata: {
        actionRequired: false,
        priority: 'high'
      }
    });
  }
};

