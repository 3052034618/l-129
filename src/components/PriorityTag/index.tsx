import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { PriorityLevel } from '@/types';

interface PriorityTagProps {
  priority: PriorityLevel;
  size?: 'sm' | 'md';
}

const priorityMap: Record<PriorityLevel, { text: string; className: string }> = {
  urgent: { text: '紧急', className: 'urgent' },
  high: { text: '高', className: 'high' },
  medium: { text: '中', className: 'medium' },
  low: { text: '低', className: 'low' }
};

const PriorityTag: React.FC<PriorityTagProps> = ({ priority, size = 'md' }) => {
  const priorityInfo = priorityMap[priority] || priorityMap.medium;

  return (
    <View
      className={classnames(
        styles.priorityTag,
        styles[priorityInfo.className],
        size === 'sm' && styles.sm
      )}
    >
      <Text className={styles.text}>{priorityInfo.text}</Text>
    </View>
  );
};

export default PriorityTag;
