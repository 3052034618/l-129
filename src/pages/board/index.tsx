import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import Empty from '@/components/Empty';
import { useApp } from '@/store/app-context';

type TabType = 'pending' | 'processing' | 'completed';

const BoardPage: React.FC = () => {
  const { user, orders: allOrders, acceptOrder, refreshOrders } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [locationFilter, setLocationFilter] = useState('全部位置');
  const [typeFilter, setTypeFilter] = useState('全部类型');
  const [priorityFilter, setPriorityFilter] = useState('全部优先级');

  useDidShow(() => {
    refreshOrders();
  });

  const filteredOrders = useMemo(() => {
    let result = allOrders.filter(order => {
      if (activeTab === 'pending') return order.status === 'pending';
      if (activeTab === 'processing') return order.status === 'processing';
      if (activeTab === 'completed') return order.status === 'completed' || order.status === 'closed';
      return true;
    });

    if (locationFilter !== '全部位置') {
      result = result.filter(order => order.location.includes(locationFilter));
    }

    if (typeFilter !== '全部类型') {
      result = result.filter(order => order.faultType === typeFilter);
    }

    if (priorityFilter !== '全部优先级') {
      result = result.filter(order => order.priority === priorityFilter);
    }

    return result.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [allOrders, activeTab, locationFilter, typeFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      pending: allOrders.filter(o => o.status === 'pending').length,
      urgent: allOrders.filter(o => o.priority === 'urgent' && o.status === 'pending').length,
      today: allOrders.filter(o => o.applyTime.includes('2024-06-01')).length,
      mine: allOrders.filter(o => o.maintainer === user.name && o.status === 'processing').length
    };
  }, [allOrders, user.name]);

  const handleAcceptOrder = (order) => {
    Taro.showModal({
      title: '确认接单',
      content: `确定要接取工单 ${order.orderNo} 吗？`,
      confirmText: '确认接单',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          acceptOrder({
            orderId: order.id,
            maintainer: user.name
          });
          Taro.showToast({
            title: '接单成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  };

  const handleLocationFilter = () => {
    Taro.showActionSheet({
      itemList: ['全部位置', 'A栋', 'B栋', 'C栋', 'D栋', 'E栋', '办公楼'],
      success: (res) => {
        const items = ['全部位置', 'A栋', 'B栋', 'C栋', 'D栋', 'E栋', '办公楼'];
        setLocationFilter(items[res.tapIndex]);
      }
    });
  };

  const handleTypeFilter = () => {
    Taro.showActionSheet({
      itemList: ['全部类型', '机械故障', '电气故障', '软件故障', '设备保养'],
      success: (res) => {
        const items = ['全部类型', '机械故障', '电气故障', '软件故障', '设备保养'];
        setTypeFilter(items[res.tapIndex]);
      }
    });
  };

  const handlePriorityFilter = () => {
    Taro.showActionSheet({
      itemList: ['全部优先级', '紧急', '高', '中', '低'],
      success: (res) => {
        const items = ['全部优先级', 'urgent', 'high', 'medium', 'low'];
        setPriorityFilter(items[res.tapIndex]);
      }
    });
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'pending', label: '待接单' },
    { key: 'processing', label: '处理中' },
    { key: 'completed', label: '已完成' }
  ];

  return (
    <View className={styles.page}>
      <View className={styles.filterBar}>
        <View className={styles.filterRow}>
          <View className={styles.filterItem} onClick={handleLocationFilter}>
            <Text className={styles.filterLabel}>位置</Text>
            <View className={styles.filterSelect}>
              <Text className={styles.selectText}>{locationFilter}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
          <View className={styles.filterItem} onClick={handleTypeFilter}>
            <Text className={styles.filterLabel}>类型</Text>
            <View className={styles.filterSelect}>
              <Text className={styles.selectText}>{typeFilter}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
          <View className={styles.filterItem} onClick={handlePriorityFilter}>
            <Text className={styles.filterLabel}>优先级</Text>
            <View className={styles.filterSelect}>
              <Text className={styles.selectText}>{priorityFilter === '全部优先级' ? '全部优先级' : priorityFilter === 'urgent' ? '紧急' : priorityFilter === 'high' ? '高' : priorityFilter === 'medium' ? '中' : '低'}</Text>
              <Text className={styles.arrow}>▼</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </View>

      {activeTab === 'pending' && (
        <View className={styles.statsBar}>
          <View className={styles.statItem}>
            <Text className={styles.number}>{stats.pending}</Text>
            <Text className={styles.label}>待接单</Text>
          </View>
          <View className={classnames(styles.statItem, styles.urgent)}>
            <Text className={styles.number}>{stats.urgent}</Text>
            <Text className={styles.label}>紧急工单</Text>
          </View>
          <View className={classnames(styles.statItem, styles.today)}>
            <Text className={styles.number}>{stats.today}</Text>
            <Text className={styles.label}>今日新增</Text>
          </View>
          <View className={classnames(styles.statItem, styles.mine)}>
            <Text className={styles.number}>{stats.mine}</Text>
            <Text className={styles.label}>我的工单</Text>
          </View>
        </View>
      )}

      <ScrollView scrollY className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <View key={order.id} className={styles.orderItem}>
              <OrderCard
                order={order}
                showAccept={activeTab === 'pending'}
                onAccept={handleAcceptOrder}
              />
            </View>
          ))
        ) : (
          <View className={styles.emptyWrap}>
            <Empty text="暂无工单" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BoardPage;
