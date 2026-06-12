import { Asset } from '@/types';

export const mockAssets: Asset[] = [
  {
    id: 'A001',
    name: '数控车床-CNC001',
    code: 'CNC-001',
    location: 'A栋-1楼-生产车间A区',
    category: '生产设备',
    status: 'maintenance',
    purchaseDate: '2022-03-15'
  },
  {
    id: 'A002',
    name: '注塑机-INJ002',
    code: 'INJ-002',
    location: 'B栋-2楼-注塑车间',
    category: '生产设备',
    status: 'fault',
    purchaseDate: '2021-08-20'
  },
  {
    id: 'A003',
    name: '空气压缩机-AC003',
    code: 'AC-003',
    location: 'C栋-1楼-动力房',
    category: '动力设备',
    status: 'normal',
    purchaseDate: '2020-11-10'
  },
  {
    id: 'A004',
    name: '自动化流水线-LINE01',
    code: 'LINE-001',
    location: 'A栋-2楼-组装车间',
    category: '生产设备',
    status: 'fault',
    purchaseDate: '2023-01-05'
  },
  {
    id: 'A005',
    name: '检测设备-TEST001',
    code: 'TEST-001',
    location: 'D栋-3楼-质检室',
    category: '检测设备',
    status: 'normal',
    purchaseDate: '2022-06-18'
  },
  {
    id: 'A006',
    name: '叉车-FORK001',
    code: 'FORK-001',
    location: 'E栋-1楼-仓库',
    category: '运输设备',
    status: 'maintenance',
    purchaseDate: '2021-04-22'
  },
  {
    id: 'A007',
    name: '空调-AC007',
    code: 'AC-007',
    location: '办公楼-3楼-会议室',
    category: '办公设备',
    status: 'normal',
    purchaseDate: '2020-09-30'
  },
  {
    id: 'A008',
    name: '激光切割机-LASER001',
    code: 'LASER-001',
    location: 'B栋-1楼-钣金车间',
    category: '生产设备',
    status: 'fault',
    purchaseDate: '2022-12-01'
  },
  {
    id: 'A009',
    name: '包装机-PACK001',
    code: 'PACK-001',
    location: 'C栋-2楼-包装车间',
    category: '生产设备',
    status: 'normal',
    purchaseDate: '2021-07-14'
  },
  {
    id: 'A010',
    name: '起重机-CRANE01',
    code: 'CRANE-001',
    location: 'A栋-1楼-生产车间',
    category: '起重设备',
    status: 'normal',
    purchaseDate: '2019-05-08'
  }
];

export const getAssetByCode = (code: string): Asset | undefined => {
  return mockAssets.find(asset => asset.code === code || asset.id === code);
};

export const getAssetById = (id: string): Asset | undefined => {
  return mockAssets.find(asset => asset.id === id);
};
