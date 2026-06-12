import { UserInfo } from '@/types';

export const mockCurrentUser: UserInfo = {
  id: 'U001',
  name: '张伟',
  phone: '13800138001',
  role: 'employee',
  department: '生产部',
  avatar: 'https://picsum.photos/id/64/200/200'
};

export const mockMaintainers: UserInfo[] = [
  {
    id: 'M001',
    name: '李工',
    phone: '13900139001',
    role: 'maintainer',
    department: '设备部',
    avatar: 'https://picsum.photos/id/91/200/200'
  },
  {
    id: 'M002',
    name: '赵师傅',
    phone: '13900139002',
    role: 'maintainer',
    department: '设备部',
    avatar: 'https://picsum.photos/id/177/200/200'
  },
  {
    id: 'M003',
    name: '孙工',
    phone: '13900139003',
    role: 'maintainer',
    department: '设备部',
    avatar: 'https://picsum.photos/id/338/200/200'
  }
];
