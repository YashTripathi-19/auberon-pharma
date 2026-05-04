export interface RestockNotification {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  desiredQuantity: number;
  notifyWhenAvailable: boolean;
  createdAt: string;
  notifiedAt: string | null;
  isNotified: boolean;
}
