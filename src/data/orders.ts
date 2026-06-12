import { WorkOrder } from '@/types';

export const mockOrders: WorkOrder[] = [
  {
    id: '1',
    orderNo: 'WO20240601001',
    assetId: 'A001',
    assetName: '数控车床-CNC001',
    assetCode: 'CNC-001',
    location: 'A栋-1楼-生产车间A区',
    faultType: '机械故障',
    faultDescription: '主轴异响严重，加工精度下降，怀疑轴承磨损。已停机等待检修。',
    photos: [
      'https://picsum.photos/id/1/600/400',
      'https://picsum.photos/id/3/600/400'
    ],
    priority: 'urgent',
    status: 'processing',
    applicant: '张伟',
    applicantPhone: '13800138001',
    applyTime: '2024-06-01 09:30:00',
    maintainer: '李工',
    acceptTime: '2024-06-01 09:45:00',
    diagnosis: '主轴轴承磨损，需要更换。',
    repairSteps: '1. 拆卸主轴箱盖板 2. 检查轴承磨损情况 3. 更换新轴承 4. 调试运行',
    downtime: 120,
    needOutsource: false,
    records: [
      {
        id: 'r1',
        orderId: '1',
        operator: '张伟',
        operatorRole: 'employee',
        action: '提交报修',
        description: '提交设备故障报修单',
        timestamp: '2024-06-01 09:30:00'
      },
      {
        id: 'r2',
        orderId: '1',
        operator: '李工',
        operatorRole: 'maintainer',
        action: '接单',
        description: '维修人员已接单，正在赶往现场',
        timestamp: '2024-06-01 09:45:00'
      },
      {
        id: 'r3',
        orderId: '1',
        operator: '李工',
        operatorRole: 'maintainer',
        action: '开始维修',
        description: '到达现场，开始故障排查',
        timestamp: '2024-06-01 10:00:00'
      }
    ],
    spareParts: [
      {
        id: 'sp1',
        name: '主轴轴承 SKF-6205',
        quantity: 2,
        estimatedArrival: '2024-06-02',
        status: 'approved',
        orderId: '1',
        applicant: '李工',
        applyTime: '2024-06-01 10:30:00'
      }
    ]
  },
  {
    id: '2',
    orderNo: 'WO20240601002',
    assetId: 'A002',
    assetName: '注塑机-INJ002',
    assetCode: 'INJ-002',
    location: 'B栋-2楼-注塑车间',
    faultType: '电气故障',
    faultDescription: '控制面板黑屏，无法开机。',
    photos: [
      'https://picsum.photos/id/201/600/400'
    ],
    priority: 'high',
    status: 'pending',
    applicant: '王芳',
    applicantPhone: '13800138002',
    applyTime: '2024-06-01 10:15:00',
    records: [
      {
        id: 'r4',
        orderId: '2',
        operator: '王芳',
        operatorRole: 'employee',
        action: '提交报修',
        description: '注塑机控制面板黑屏无法开机',
        timestamp: '2024-06-01 10:15:00'
      }
    ],
    spareParts: []
  },
  {
    id: '3',
    orderNo: 'WO20240531003',
    assetId: 'A003',
    assetName: '空气压缩机-AC003',
    assetCode: 'AC-003',
    location: 'C栋-1楼-动力房',
    faultType: '设备保养',
    faultDescription: '定期保养，更换空气滤芯和机油。',
    photos: [],
    priority: 'low',
    status: 'completed',
    applicant: '陈明',
    applicantPhone: '13800138003',
    applyTime: '2024-05-31 14:00:00',
    maintainer: '赵师傅',
    acceptTime: '2024-05-31 14:30:00',
    completedTime: '2024-05-31 16:00:00',
    diagnosis: '定期保养',
    repairSteps: '1. 更换空气滤芯 2. 更换机油 3. 检查管路 4. 试机运行',
    downtime: 90,
    needOutsource: false,
    evaluation: {
      score: 5,
      content: '维修及时，服务态度好，设备运行正常。',
      time: '2024-05-31 17:00:00'
    },
    records: [
      {
        id: 'r5',
        orderId: '3',
        operator: '陈明',
        operatorRole: 'employee',
        action: '提交报修',
        description: '申请定期保养',
        timestamp: '2024-05-31 14:00:00'
      },
      {
        id: 'r6',
        orderId: '3',
        operator: '赵师傅',
        operatorRole: 'maintainer',
        action: '接单',
        description: '已接单，准备保养材料',
        timestamp: '2024-05-31 14:30:00'
      },
      {
        id: 'r7',
        orderId: '3',
        operator: '赵师傅',
        operatorRole: 'maintainer',
        action: '完成维修',
        description: '保养完成，设备运行正常',
        timestamp: '2024-05-31 16:00:00'
      },
      {
        id: 'r8',
        orderId: '3',
        operator: '陈明',
        operatorRole: 'employee',
        action: '评价',
        description: '用户确认并评价',
        timestamp: '2024-05-31 17:00:00'
      }
    ],
    spareParts: []
  },
  {
    id: '4',
    orderNo: 'WO20240601004',
    assetId: 'A004',
    assetName: '自动化流水线-LINE01',
    assetCode: 'LINE-001',
    location: 'A栋-2楼-组装车间',
    faultType: '机械故障',
    faultDescription: '传送带偏移，产品无法正常输送。',
    photos: [
      'https://picsum.photos/id/6/600/400',
      'https://picsum.photos/id/8/600/400',
      'https://picsum.photos/id/9/600/400'
    ],
    priority: 'urgent',
    status: 'pending',
    applicant: '刘洋',
    applicantPhone: '13800138004',
    applyTime: '2024-06-01 08:00:00',
    records: [
      {
        id: 'r9',
        orderId: '4',
        operator: '刘洋',
        operatorRole: 'employee',
        action: '提交报修',
        description: '流水线传送带偏移',
        timestamp: '2024-06-01 08:00:00'
      }
    ],
    spareParts: []
  },
  {
    id: '5',
    orderNo: 'WO20240530005',
    assetId: 'A005',
    assetName: '检测设备-TEST001',
    assetCode: 'TEST-001',
    location: 'D栋-3楼-质检室',
    faultType: '软件故障',
    faultDescription: '检测软件频繁报错，数据无法保存。',
    photos: [],
    priority: 'medium',
    status: 'completed',
    applicant: '周静',
    applicantPhone: '13800138005',
    applyTime: '2024-05-30 09:00:00',
    maintainer: '孙工',
    acceptTime: '2024-05-30 09:30:00',
    completedTime: '2024-05-30 14:00:00',
    diagnosis: '软件数据库损坏',
    repairSteps: '1. 备份数据 2. 修复数据库 3. 重装软件 4. 恢复数据 5. 测试验证',
    downtime: 300,
    needOutsource: true,
    outsourceCompany: 'XX科技有限公司',
    evaluation: {
      score: 4,
      content: '维修时间稍长，但最终解决了问题。',
      time: '2024-05-30 16:00:00'
    },
    records: [
      {
        id: 'r10',
        orderId: '5',
        operator: '周静',
        operatorRole: 'employee',
        action: '提交报修',
        description: '检测软件报错',
        timestamp: '2024-05-30 09:00:00'
      },
      {
        id: 'r11',
        orderId: '5',
        operator: '孙工',
        operatorRole: 'maintainer',
        action: '接单',
        description: '已接单，安排外协处理',
        timestamp: '2024-05-30 09:30:00'
      },
      {
        id: 'r12',
        orderId: '5',
        operator: '孙工',
        operatorRole: 'maintainer',
        action: '外协介入',
        description: '外协公司进场处理软件问题',
        timestamp: '2024-05-30 11:00:00'
      },
      {
        id: 'r13',
        orderId: '5',
        operator: '孙工',
        operatorRole: 'maintainer',
        action: '完成维修',
        description: '软件修复完成，数据恢复正常',
        timestamp: '2024-05-30 14:00:00'
      }
    ],
    spareParts: []
  },
  {
    id: '6',
    orderNo: 'WO20240601006',
    assetId: 'A006',
    assetName: '叉车-FORK001',
    assetCode: 'FORK-001',
    location: 'E栋-1楼-仓库',
    faultType: '机械故障',
    faultDescription: '升降不顺畅，有异响。',
    photos: [
      'https://picsum.photos/id/119/600/400'
    ],
    priority: 'medium',
    status: 'processing',
    applicant: '吴强',
    applicantPhone: '13800138006',
    applyTime: '2024-06-01 07:30:00',
    maintainer: '李工',
    acceptTime: '2024-06-01 08:00:00',
    diagnosis: '液压系统缺油，需要补充液压油。',
    downtime: 0,
    needOutsource: false,
    records: [
      {
        id: 'r14',
        orderId: '6',
        operator: '吴强',
        operatorRole: 'employee',
        action: '提交报修',
        description: '叉车升降异响',
        timestamp: '2024-06-01 07:30:00'
      },
      {
        id: 'r15',
        orderId: '6',
        operator: '李工',
        operatorRole: 'maintainer',
        action: '接单',
        description: '已接单，前往仓库',
        timestamp: '2024-06-01 08:00:00'
      }
    ],
    spareParts: []
  },
  {
    id: '7',
    orderNo: 'WO20240528007',
    assetId: 'A001',
    assetName: '数控车床-CNC001',
    assetCode: 'CNC-001',
    location: 'A栋-1楼-生产车间A区',
    faultType: '电气故障',
    faultDescription: '伺服驱动器报警，设备无法启动。',
    photos: [],
    priority: 'high',
    status: 'closed',
    applicant: '张伟',
    applicantPhone: '13800138001',
    applyTime: '2024-05-28 10:00:00',
    maintainer: '李工',
    acceptTime: '2024-05-28 10:30:00',
    completedTime: '2024-05-28 15:00:00',
    diagnosis: '伺服驱动器损坏',
    repairSteps: '更换伺服驱动器',
    downtime: 300,
    needOutsource: false,
    evaluation: {
      score: 5,
      content: '维修专业，响应迅速。',
      time: '2024-05-28 16:00:00'
    },
    records: [],
    spareParts: []
  },
  {
    id: '8',
    orderNo: 'WO20240529008',
    assetId: 'A007',
    assetName: '空调-AC007',
    assetCode: 'AC-007',
    location: '办公楼-3楼-会议室',
    faultType: '设备保养',
    faultDescription: '空调制冷效果差，需要清洗。',
    photos: [],
    priority: 'low',
    status: 'completed',
    applicant: '郑丽',
    applicantPhone: '13800138007',
    applyTime: '2024-05-29 09:00:00',
    maintainer: '赵师傅',
    acceptTime: '2024-05-29 10:00:00',
    completedTime: '2024-05-29 11:30:00',
    diagnosis: '滤网堵塞',
    repairSteps: '清洗滤网和蒸发器',
    downtime: 0,
    needOutsource: false,
    evaluation: {
      score: 5,
      content: '服务很好，空调效果恢复了。',
      time: '2024-05-29 14:00:00'
    },
    records: [],
    spareParts: []
  },
  {
    id: '9',
    orderNo: 'WO20240601009',
    assetId: 'A008',
    assetName: '激光切割机-LASER001',
    assetCode: 'LASER-001',
    location: 'B栋-1楼-钣金车间',
    faultType: '机械故障',
    faultDescription: '切割头无法正常移动，导轨有卡顿感。',
    photos: [
      'https://picsum.photos/id/160/600/400'
    ],
    priority: 'high',
    status: 'pending',
    applicant: '黄明',
    applicantPhone: '13800138008',
    applyTime: '2024-06-01 06:30:00',
    records: [
      {
        id: 'r16',
        orderId: '9',
        operator: '黄明',
        operatorRole: 'employee',
        action: '提交报修',
        description: '激光切割机导轨卡顿',
        timestamp: '2024-06-01 06:30:00'
      }
    ],
    spareParts: []
  },
  {
    id: '10',
    orderNo: 'WO20240527010',
    assetId: 'A009',
    assetName: '包装机-PACK001',
    assetCode: 'PACK-001',
    location: 'C栋-2楼-包装车间',
    faultType: '电气故障',
    faultDescription: '封口不牢固，经常开胶。',
    photos: [],
    priority: 'medium',
    status: 'closed',
    applicant: '林燕',
    applicantPhone: '13800138009',
    applyTime: '2024-05-27 13:00:00',
    maintainer: '孙工',
    acceptTime: '2024-05-27 13:30:00',
    completedTime: '2024-05-27 15:00:00',
    diagnosis: '加热管老化',
    repairSteps: '更换加热管，调整温度参数',
    downtime: 120,
    needOutsource: false,
    evaluation: {
      score: 4,
      content: '解决了问题，包装质量稳定了。',
      time: '2024-05-27 16:00:00'
    },
    records: [],
    spareParts: []
  }
];

export const getOrderById = (id: string): WorkOrder | undefined => {
  return mockOrders.find(order => order.id === id);
};

export const getOrdersByStatus = (status: string): WorkOrder[] => {
  if (status === 'all') return mockOrders;
  return mockOrders.filter(order => order.status === status);
};

export const getPendingOrders = (): WorkOrder[] => {
  return mockOrders.filter(order => order.status === 'pending');
};
