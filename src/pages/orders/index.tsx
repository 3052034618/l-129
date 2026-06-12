import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import OrderCard from '@/components/OrderCard';
import Empty from '@/components/Empty';
import { useApp } from '@/store/app-context';

const OrdersPage: React.FC = () => {
  const { user, orders: allOrders, refreshOrders } = useApp();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [onlyMine, setOnlyMine] = useState(false);

  const isMaintainerRole = user.role === 'maintainer' || user.role === 'admin';

  useDidShow(() => {
    refreshOrders();
  });

  const filteredOrders = useMemo(() => {
    let result = allOrders;

    if (activeTab !== 'all') {
      result = result.filter(order => order.status === activeTab);
    }

    if (onlyMine) {
      if (user.role === 'employee') {
        result = result.filter(o => o.applicant === user.name);
      } else if (isMaintainerRole) {
        result = result.filter(o => o.maintainer === user.name);
      }
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(order =>
        order.orderNo.toLowerCase().includes(keyword) ||
        order.assetName.toLowerCase().includes(keyword) ||
        order.assetCode.toLowerCase().includes(keyword) ||
        order.location.toLowerCase().includes(keyword) ||
        order.faultDescription.toLowerCase().includes(keyword)
      );
    }

    return result.sort((a, b) => {
      return new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime();
    });
  }, [allOrders, activeTab, searchText, onlyMine, user.name, user.role, isMaintainerRole]);

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待接单' },
    { key: 'processing', label: '处理中' },
    { key: 'completed', label: '已完成' },
    { key: 'closed', label: '已关闭' }
  ];

  const handleSearch = (e: any) => {
    setSearchText(e.detail.value);
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchWrap}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索工单编号、设备名称、位置..."
            placeholderClass={styles.searchPlaceholder}
            value={searchText}
            onInput={handleSearch}
            confirmType="search"
          />
        </View>
      </View>

      <View className={styles.filterRow}>
        <View className={styles.mineFilter}>
          <Text className={styles.mineLabel}>只看我的工单</Text>
          <View
            className={classnames(styles.mineSwitch, onlyMine && styles.on)}
            onClick={() => setOnlyMine(!onlyMine)}
          />
        </View>
      </View>

      <ScrollView scrollX className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <View key={order.id} className={styles.orderItem}>
              <OrderCard order={order} />
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

export default OrdersPage;
