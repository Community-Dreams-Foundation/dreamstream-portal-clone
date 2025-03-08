
import { getDatabase, ref, update, onValue, off, push } from "firebase/database";
import type { WaiverRequest } from "@/types/waiver";
import { useNotifications } from "@/contexts/NotificationContext";

export class WaiverService {
  private static listenersCount = 0;

  static async updateWaiverStatus(
    waiverId: string, 
    status: "approved" | "rejected",
    reviewComments: string
  ) {
    const db = getDatabase();
    const waiverRef = ref(db, `waivers/${waiverId}`);
    
    await update(waiverRef, {
      status,
      review_comments: reviewComments,
      reviewed_at: new Date().toISOString()
    });

    // Add notification for status update
    const notification = {
      title: `Waiver ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your waiver request has been ${status}. ${reviewComments}`,
      type: "waiver" as const,
      metadata: {
        waiverId,
        actionRequired: status === "rejected",
        priority: status === "rejected" ? "high" as const : "medium" as const,
      }
    };

    // Get the notification context
    const { addNotification } = useNotifications();
    await addNotification(notification);
  }

  static async createWaiverTemplate(template: {
    name: string;
    content: string;
    category: string;
  }) {
    const db = getDatabase();
    const templatesRef = ref(db, "waiver_templates");
    return push(templatesRef, {
      ...template,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  static subscribeToWaiverTemplates(callback: (templates: any[]) => void) {
    const db = getDatabase();
    const templatesRef = ref(db, "waiver_templates");

    onValue(templatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const templatesData = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          id,
          ...data
        }));
        callback(templatesData);
      } else {
        callback([]);
      }
    });

    return () => off(templatesRef);
  }

  static subscribeToWaivers(callback: (waivers: WaiverRequest[]) => void) {
    this.listenersCount++;
    const db = getDatabase();
    const waiversRef = ref(db, "waivers");

    onValue(waiversRef, (snapshot) => {
      if (snapshot.exists()) {
        const waiversData = Object.entries(snapshot.val()).map(([id, data]: [string, any]) => ({
          waiver_id: id,
          ...data
        }));
        callback(waiversData);
      } else {
        callback([]);
      }
    });

    return () => {
      this.listenersCount--;
      if (this.listenersCount === 0) {
        off(waiversRef);
      }
    };
  }
}
