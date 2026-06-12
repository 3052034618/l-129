import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { OrderStatus } from '@/types';

interface StatusTagProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const statusMap: Record<OrderStatus, { text: string; className: string }> = {
  pending: { text: '待接单', className: 'pending' },
  processing: { text: '处理中', className: 'processing' },
  completed: { text: '已完成', className: 'completed' },
  closed: { text: '已关闭', className: 'closed' }
};

const StatusTag: React.FC<StatusTagProps> = ({ status, size = 'md' }) => {
  const statusInfo = statusMap[status] || statusMap.pending;

  return (
    <View
      className={classnames(
        styles.statusTag,
        styles[statusInfo.className],
        size === 'sm' && styles.sm
      )}
    >
      <Text className={styles.text}>{statusInfo.text}</Text>
    </View>
  );
};

export default StatusTag;
