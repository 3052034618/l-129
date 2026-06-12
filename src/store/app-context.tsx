import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { UserInfo, UserRole, WorkOrder, SparePart, RepairRecord } from '@/types';
import { mockCurrentUser } from '@/data/users';
import { mockOrders } from '@/data/orders';
import { generateOrderNo, formatDateTime } from '@/utils';

const ORDERS_STORAGE_KEY = 'repair_orders_data';
const USER_STORAGE_KEY = 'repair_user_data';

interface AcceptOrderParams {
  orderId: string;
  maintainer: string;
}

interface CompleteRepairParams {
  orderId: string;
  diagnosis: string;
  repairSteps: string;
  downtime: number;
  needOutsource: boolean;
  outsourceCompany?: string;
}

interface AddSparePartsParams {
  orderId: string;
  parts: Omit<SparePart, 'id' | 'status' | 'orderId' | 'applicant' | 'applyTime'>[];
  applicant: string;
}

interface SubmitEvaluationParams {
  orderId: string;
  score: number;
  content: string;
}

interface AppContextType {
  user: UserInfo;
  setUser: (user: UserInfo) => void;
  switchRole: (role: UserRole) => void;
  orders: WorkOrder[];
  getOrderById: (id: string) => WorkOrder | undefined;
  addOrder: (order: Omit<WorkOrder, 'id' | 'orderNo' | 'status' | 'applyTime' | 'records' | 'spareParts'>) => WorkOrder;
  acceptOrder: (params: AcceptOrderParams) => void;
  completeRepair: (params: CompleteRepairParams) => void;
  addSpareParts: (params: AddSparePartsParams) => void;
  submitEvaluation: (params: SubmitEvaluationParams) => void;
  refreshOrders: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadOrdersFromStorage = (): WorkOrder[] => {
  try {
    const stored = Taro.getStorageSync(ORDERS_STORAGE_KEY);
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
  } catch (e) {
    // ignore
  }
  return [...mockOrders];
};

const saveOrdersToStorage = (orders: WorkOrder[]) => {
  try {
    Taro.setStorageSync(ORDERS_STORAGE_KEY, orders);
  } catch (e) {
    // ignore
  }
};

const loadUserFromStorage = (): UserInfo => {
  try {
    const stored = Taro.getStorageSync(USER_STORAGE_KEY);
    if (stored && stored.id) {
      return stored;
    }
  } catch (e) {
    // ignore
  }
  return mockCurrentUser;
};

const saveUserToStorage = (user: UserInfo) => {
  try {
    Taro.setStorageSync(USER_STORAGE_KEY, user);
  } catch (e) {
    // ignore
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserInfo>(() => loadUserFromStorage());
  const [orders, setOrders] = useState<WorkOrder[]>(() => loadOrdersFromStorage());

  useEffect(() => {
    saveUserToStorage(user);
  }, [user]);

  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);

  const setUser = useCallback((newUser: UserInfo) => {
    setUserState(newUser);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setUserState(prev => ({
      ...prev,
      role
    }));
  }, []);

  const getOrderById = useCallback((id: string): WorkOrder | undefined => {
    return orders.find(o => o.id === id);
  }, [orders]);

  const addOrder = useCallback((orderData: Omit<WorkOrder, 'id' | 'orderNo' | 'status' | 'applyTime' | 'records' | 'spareParts'>): WorkOrder => {
    const now = formatDateTime(new Date());
    const newId = Date.now().toString();
    const newOrder: WorkOrder = {
      ...orderData,
      id: newId,
      orderNo: generateOrderNo(),
      status: 'pending',
      applyTime: now,
      records: [
        {
          id: `r_${newId}_1`,
          orderId: newId,
          operator: orderData.applicant,
          operatorRole: 'employee',
          action: '提交报修',
          description: orderData.faultDescription,
          timestamp: now
        }
      ],
      spareParts: []
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, []);

  const acceptOrder = useCallback(({ orderId, maintainer }: AcceptOrderParams) => {
    const now = formatDateTime(new Date());
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const newRecord: RepairRecord = {
        id: `r_${orderId}_${Date.now()}`,
        orderId,
        operator: maintainer,
        operatorRole: 'maintainer',
        action: '接单',
        description: '维修人员已接单，正在赶往现场',
        timestamp: now
      };
      return {
        ...order,
        status: 'processing',
        maintainer,
        acceptTime: now,
        records: [...order.records, newRecord]
      };
    }));
  }, []);

  const completeRepair = useCallback(({
    orderId,
    diagnosis,
    repairSteps,
    downtime,
    needOutsource,
    outsourceCompany
  }: CompleteRepairParams) => {
    const now = formatDateTime(new Date());
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const newRecord: RepairRecord = {
        id: `r_${orderId}_${Date.now()}`,
        orderId,
        operator: order.maintainer || '维修人员',
        operatorRole: 'maintainer',
        action: '完成维修',
        description: `排查原因：${diagnosis}；维修步骤：${repairSteps}`,
        timestamp: now
      };
      return {
        ...order,
        status: 'completed',
        completedTime: now,
        diagnosis,
        repairSteps,
        downtime,
        needOutsource,
        outsourceCompany: needOutsource ? outsourceCompany : undefined,
        records: [...order.records, newRecord]
      };
    }));
  }, []);

  const addSpareParts = useCallback(({ orderId, parts, applicant }: AddSparePartsParams) => {
    const now = formatDateTime(new Date());
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const newParts: SparePart[] = parts.map((p, idx) => ({
        ...p,
        id: `sp_${orderId}_${Date.now()}_${idx}`,
        status: 'pending',
        orderId,
        applicant,
        applyTime: now
      }));
      const newRecord: RepairRecord = {
        id: `r_${orderId}_${Date.now()}`,
        orderId,
        operator: applicant,
        operatorRole: 'maintainer',
        action: '申请备件',
        description: `申请备件 ${newParts.length} 件：${newParts.map(p => p.name).join('、')}`,
        timestamp: now
      };
      return {
        ...order,
        spareParts: [...order.spareParts, ...newParts],
        records: [...order.records, newRecord]
      };
    }));
  }, []);

  const submitEvaluation = useCallback(({ orderId, score, content }: SubmitEvaluationParams) => {
    const now = formatDateTime(new Date());
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const newRecord: RepairRecord = {
        id: `r_${orderId}_${Date.now()}`,
        orderId,
        operator: order.applicant,
        operatorRole: 'employee',
        action: '评价',
        description: `用户评价 ${score} 分：${content}`,
        timestamp: now
      };
      return {
        ...order,
        status: 'closed',
        evaluation: {
          score,
          content,
          time: now
        },
        records: [...order.records, newRecord]
      };
    }));
  }, []);

  const refreshOrders = useCallback(() => {
    setOrders(loadOrdersFromStorage());
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        orders,
        getOrderById,
        addOrder,
        acceptOrder,
        completeRepair,
        addSpareParts,
        submitEvaluation,
        refreshOrders
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
