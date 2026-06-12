import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import PriorityTag from '@/components/PriorityTag';
import { WorkOrder } from '@/types';

interface OrderCardProps {
  order: WorkOrder;
  onClick?: (order: WorkOrder) => void;
  showAccept?: boolean;
  onAccept?: (order: WorkOrder) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, showAccept = false, onAccept }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(order);
    } else {
      Taro.navigateTo({
        url: `/pages/order-detail/index?id=${order.id}`
      });
    }
  };

  const handleAccept = (e: any) => {
    e.stopPropagation();
    if (onAccept) {
      onAccept(order);
    }
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.leftInfo}>
          <Text className={styles.orderNo}>{order.orderNo}</Text>
        </View>
        <View className={styles.rightInfo}>
          <StatusTag status={order.status} size="sm" />
        </View>
      </View>

      <View className={styles.cardBody}>
        <View className={styles.assetInfo}>
          <Text className={styles.assetName}>{order.assetName}</Text>
          <View className={styles.assetMeta}>
            <Text className={styles.metaText}>📍 {order.location}</Text>
          </View>
        </View>

        <View className={styles.faultInfo}>
          <View className={styles.faultTypeRow}>
            <Text className={styles.faultType}>{order.faultType}</Text>
            <PriorityTag priority={order.priority} size="sm" />
          </View>
          <Text className={styles.faultDesc}>{order.faultDescription}</Text>
        </View>

        {order.photos && order.photos.length > 0 && (
          <View className={styles.photoList}>
            {order.photos.slice(0, 3).map((photo, index) => (
              <Image
                key={index}
                src={photo}
                className={styles.photo}
                mode="aspectFill"
              />
            ))}
            {order.photos.length > 3 && (
              <View className={styles.morePhoto}>
                <Text className={styles.moreText}>+{order.photos.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.footerLeft}>
          <Text className={styles.applicant}>报修人：{order.applicant}</Text>
          <Text className={styles.time}>{order.applyTime}</Text>
        </View>
        {showAccept && order.status === 'pending' && (
          <View className={styles.acceptBtn} onClick={handleAccept}>
            <Text className={styles.acceptText}>接单</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default OrderCard;
