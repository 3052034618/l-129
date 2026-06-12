export type OrderStatus = 'pending' | 'processing' | 'completed' | 'closed';

export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';

export type UserRole = 'employee' | 'maintainer' | 'admin';

export interface Asset {
  id: string;
  name: string;
  code: string;
  location: string;
  category: string;
  status: 'normal' | 'fault' | 'maintenance';
  purchaseDate: string;
}

export interface RepairRecord {
  id: string;
  orderId: string;
  operator: string;
  operatorRole: UserRole;
  action: string;
  description: string;
  timestamp: string;
  photos?: string[];
}

export interface SparePart {
  id: string;
  name: string;
  quantity: number;
  estimatedArrival: string;
  status: 'pending' | 'approved' | 'rejected' | 'arrived';
  orderId: string;
  applicant: string;
  applyTime: string;
}

export interface WorkOrder {
  id: string;
  orderNo: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  location: string;
  faultType: string;
  faultDescription: string;
  photos: string[];
  priority: PriorityLevel;
  status: OrderStatus;
  applicant: string;
  applicantPhone: string;
  applyTime: string;
  maintainer?: string;
  acceptTime?: string;
  completedTime?: string;
  diagnosis?: string;
  repairSteps?: string;
  downtime?: number;
  needOutsource?: boolean;
  outsourceCompany?: string;
  evaluation?: {
    score: number;
    content: string;
    time: string;
  };
  records: RepairRecord[];
  spareParts: SparePart[];
}

export interface UserInfo {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

export interface StatisticsData {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  unresponsiveOrders: number;
  timeoutOrders: number;
  repeatedFaults: number;
  avgRepairTime: number;
  satisfactionRate: number;
}
