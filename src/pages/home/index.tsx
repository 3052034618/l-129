import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import { useApp } from '@/store/app-context';

const HomePage: React.FC = () => {
  const { user, orders, refreshOrders } = useApp();

  useDidShow(() => {
    refreshOrders();
  });

  const myOrders = useMemo(() => {
    return orders.filter(order => order.applicant === user.name);
  }, [orders, user.name]);

  const stats = useMemo(() => {
    return {
      total: myOrders.length,
      pending: myOrders.filter(o => o.status === 'pending').length,
      processing: myOrders.filter(o => o.status === 'processing').length,
      completed: myOrders.filter(o => o.status === 'completed' || o.status === 'closed').length
    };
  }, [myOrders]);

  const recentOrders = useMemo(() => {
    return [...myOrders]
      .sort((a, b) => new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime())
      .slice(0, 3);
  }, [myOrders]);

  const handleScanRepair = () => {
    Taro.navigateTo({
      url: '/pages/repair-submit/index?mode=scan'
    });
  };

  const handleManualRepair = () => {
    Taro.navigateTo({
      url: '/pages/repair-submit/index?mode=manual'
    });
  };

  const handleViewAll = () => {
    Taro.switchTab({
      url: '/pages/orders/index'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Text className={styles.greeting}>{getGreeting()}，{user.name}</Text>
          <Text className={styles.subGreeting}>今天有 {stats.pending} 个待处理工单</Text>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={`${styles.actionCard} ${styles.scan}`} onClick={handleScanRepair}>
          <View className={styles.icon}>
            <Text className={styles.iconText}>📷</Text>
          </View>
          <Text className={styles.title}>扫码报修</Text>
          <Text className={styles.desc}>扫描设备二维码快速报修</Text>
        </View>
        <View className={`${styles.actionCard} ${styles.manual}`} onClick={handleManualRepair}>
          <View className={styles.icon}>
            <Text className={styles.iconText}>✏️</Text>
          </View>
          <Text className={styles.title}>手动报修</Text>
          <Text className={styles.desc}>手动选择设备提交报修</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>工单统计</Text>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.number}>{stats.total}</Text>
            <Text className={styles.label}>全部工单</Text>
          </View>
          <View className={`${styles.statCard} ${styles.urgent}`}>
            <Text className={styles.number}>{stats.pending}</Text>
            <Text className={styles.label}>待接单</Text>
          </View>
          <View className={`${styles.statCard} ${styles.processing}`}>
            <Text className={styles.number}>{stats.processing}</Text>
            <Text className={styles.label}>处理中</Text>
          </View>
          <View className={`${styles.statCard} ${styles.completed}`}>
            <Text className={styles.number}>{stats.completed}</Text>
            <Text className={styles.label}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>我的工单</Text>
          <Text className={styles.more} onClick={handleViewAll}>查看全部 →</Text>
        </View>
        <View className={styles.orderList}>
          {recentOrders.map(order => (
            <View key={order.id} className={styles.orderItem}>
              <OrderCard order={order} />
            </View>
          ))}
          {recentOrders.length === 0 && (
            <View style={{ padding: '40rpx 0', textAlign: 'center' }}>
              <Text style={{ color: '#86909c', fontSize: '28rpx' }}>暂无工单记录</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>紧急程度说明</Text>
        </View>
        <View className={styles.priorityGuide}>
          <View className={styles.guideList}>
            <View className={styles.guideItem}>
              <View className={`${styles.dot} ${styles.urgent}`}></View>
              <Text className={styles.text}>紧急 - 设备完全故障，影响生产，需立即响应</Text>
            </View>
            <View className={styles.guideItem}>
              <View className={`${styles.dot} ${styles.high}`}></View>
              <Text className={styles.text}>高 - 设备部分功能异常，影响效率</Text>
            </View>
            <View className={styles.guideItem}>
              <View className={`${styles.dot} ${styles.medium}`}></View>
              <Text className={styles.text}>中 - 一般故障，不影响正常生产</Text>
            </View>
            <View className={styles.guideItem}>
              <View className={`${styles.dot} ${styles.low}`}></View>
              <Text className={styles.text}>低 - 定期保养或小问题，可延后处理</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
