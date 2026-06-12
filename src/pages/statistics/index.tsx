import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { PriorityLevel } from '@/types';
import { useApp } from '@/store/app-context';

type TabType = 'overview' | 'fault' | 'efficiency';

const StatisticsPage: React.FC = () => {
  const { user, orders, refreshOrders } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useDidShow(() => {
    refreshOrders();
  });

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const processing = orders.filter(o => o.status === 'processing').length;
    const completed = orders.filter(o => o.status === 'completed' || o.status === 'closed').length;

    const unresponsive = orders.filter(o => {
      if (o.status !== 'pending') return false;
      const applyTime = new Date(o.applyTime).getTime();
      const now = new Date('2024-06-01 12:00:00').getTime();
      return (now - applyTime) > 2 * 60 * 60 * 1000;
    }).length;

    const timeout = orders.filter(o => {
      if (o.status === 'completed' || o.status === 'closed') {
        if (!o.acceptTime || !o.completedTime) return false;
        const acceptTime = new Date(o.acceptTime).getTime();
        const completedTime = new Date(o.completedTime).getTime();
        const duration = (completedTime - acceptTime) / (1000 * 60);
        const expectedDuration = o.priority === 'urgent' ? 60 : o.priority === 'high' ? 120 : 240;
        return duration > expectedDuration;
      }
      if (o.status === 'processing') {
        if (!o.acceptTime) return false;
        const acceptTime = new Date(o.acceptTime).getTime();
        const now = new Date('2024-06-01 12:00:00').getTime();
        const duration = (now - acceptTime) / (1000 * 60);
        const expectedDuration = o.priority === 'urgent' ? 60 : o.priority === 'high' ? 120 : 240;
        return duration > expectedDuration;
      }
      return false;
    }).length;

    const assetCountMap: Record<string, { count: number; name: string; location: string }> = {};
    orders.forEach(order => {
      if (!assetCountMap[order.assetId]) {
        assetCountMap[order.assetId] = {
          count: 0,
          name: order.assetName,
          location: order.location
        };
      }
      assetCountMap[order.assetId].count++;
    });
    const repeatedFaultAssets = Object.values(assetCountMap)
      .filter(item => item.count > 1)
      .sort((a, b) => b.count - a.count);

    const evaluatedOrders = orders.filter(o => o.evaluation);
    const avgScore = evaluatedOrders.length > 0
      ? evaluatedOrders.reduce((sum, o) => sum + (o.evaluation?.score || 0), 0) / evaluatedOrders.length
      : 0;
    const satisfactionRate = evaluatedOrders.length > 0
      ? Math.round(evaluatedOrders.filter(o => (o.evaluation?.score || 0) >= 4).length / evaluatedOrders.length * 100)
      : 0;

    const completedWithTime = orders.filter(o => o.acceptTime && o.completedTime);
    const avgRepairTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, o) => {
          const accept = new Date(o.acceptTime!).getTime();
          const complete = new Date(o.completedTime!).getTime();
          return sum + (complete - accept) / (1000 * 60);
        }, 0) / completedWithTime.length
      : 0;

    const pendingWithTime = orders.filter(o => o.status === 'pending');
    const avgResponseTime = pendingWithTime.length > 0
      ? pendingWithTime.reduce((sum, o) => {
          const apply = new Date(o.applyTime).getTime();
          const now = new Date('2024-06-01 12:00:00').getTime();
          return sum + (now - apply) / (1000 * 60);
        }, 0) / pendingWithTime.length
      : 0;

    return {
      total,
      pending,
      processing,
      completed,
      unresponsive,
      timeout,
      repeatedFaults: repeatedFaultAssets.length,
      repeatedFaultAssets,
      avgScore: avgScore.toFixed(1),
      satisfactionRate,
      avgRepairTime: Math.round(avgRepairTime),
      avgResponseTime: Math.round(avgResponseTime)
    };
  }, [orders]);

  const faultTypeStats = useMemo(() => {
    const typeMap: Record<string, number> = {};
    orders.forEach(order => {
      typeMap[order.faultType] = (typeMap[order.faultType] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(typeMap), 1);
    return Object.entries(typeMap)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round(count / maxCount * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const priorityStats = useMemo(() => {
    const priorityMap: Record<PriorityLevel, number> = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    orders.forEach(order => {
      priorityMap[order.priority]++;
    });
    const priorityLabels: Record<PriorityLevel, string> = {
      urgent: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    };
    const priorityColors: Record<PriorityLevel, string> = {
      urgent: '#f53f3f',
      high: '#ff7d00',
      medium: '#165dff',
      low: '#00b42a'
    };
    return (Object.keys(priorityMap) as PriorityLevel[]).map(priority => ({
      priority,
      label: priorityLabels[priority],
      count: priorityMap[priority],
      color: priorityColors[priority]
    }));
  }, [orders]);

  const locationStats = useMemo(() => {
    const locationMap: Record<string, number> = {};
    orders.forEach(order => {
      const building = order.location.split('-')[0];
      locationMap[building] = (locationMap[building] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(locationMap), 1);
    return Object.entries(locationMap)
      .map(([location, count]) => ({
        location,
        count,
        percentage: Math.round(count / maxCount * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'overview', label: '概览' },
    { key: 'fault', label: '故障分析' },
    { key: 'efficiency', label: '效率分析' }
  ];

  const unresponsiveOrders = useMemo(() => {
    return orders
      .filter(o => {
        if (o.status !== 'pending') return false;
        const applyTime = new Date(o.applyTime).getTime();
        const now = new Date('2024-06-01 12:00:00').getTime();
        return (now - applyTime) > 2 * 60 * 60 * 1000;
      })
      .sort((a, b) => new Date(a.applyTime).getTime() - new Date(b.applyTime).getTime());
  }, [orders]);

  const timeoutOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status === 'completed' || o.status === 'closed') {
        if (!o.acceptTime || !o.completedTime) return false;
        const acceptTime = new Date(o.acceptTime).getTime();
        const completedTime = new Date(o.completedTime).getTime();
        const duration = (completedTime - acceptTime) / (1000 * 60);
        const expectedDuration = o.priority === 'urgent' ? 60 : o.priority === 'high' ? 120 : 240;
        return duration > expectedDuration;
      }
      if (o.status === 'processing') {
        if (!o.acceptTime) return false;
        const acceptTime = new Date(o.acceptTime).getTime();
        const now = new Date('2024-06-01 12:00:00').getTime();
        const duration = (now - acceptTime) / (1000 * 60);
        const expectedDuration = o.priority === 'urgent' ? 60 : o.priority === 'high' ? 120 : 240;
        return duration > expectedDuration;
      }
      return false;
    });
  }, [orders]);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>统计中心</Text>
        <Text className={styles.subtitle}>当前角色：{user.role === 'admin' ? '管理员' : user.role === 'maintainer' ? '维修人员' : '员工'}</Text>
      </View>

      <View className={styles.summaryCards}>
        <View className={styles.summaryCard}>
          <Text className={styles.number}>{stats.total}</Text>
          <Text className={styles.label}>总工单</Text>
        </View>
        <View className={classnames(styles.summaryCard, styles.warning)}>
          <Text className={styles.number}>{stats.unresponsive}</Text>
          <Text className={styles.label}>未响应</Text>
        </View>
        <View className={classnames(styles.summaryCard, styles.error)}>
          <Text className={styles.number}>{stats.timeout}</Text>
          <Text className={styles.label}>超时</Text>
        </View>
        <View className={classnames(styles.summaryCard, styles.success)}>
          <Text className={styles.number}>{stats.satisfactionRate}%</Text>
          <Text className={styles.label}>满意度</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.tabBar}>
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
      </View>

      {activeTab === 'overview' && (
        <>
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>告警提醒</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.warnList}>
                <View className={styles.warnItem}>
                  <View className={classnames(styles.warnIcon, styles.error)}>
                    <Text>⏰</Text>
                  </View>
                  <View className={styles.warnContent}>
                    <Text className={styles.warnTitle}>未响应工单</Text>
                    <Text className={styles.warnDesc}>超过2小时未接单的工单</Text>
                  </View>
                  <Text className={styles.warnCount}>{stats.unresponsive}</Text>
                </View>
                <View className={styles.warnItem}>
                  <View className={classnames(styles.warnIcon, styles.error)}>
                    <Text>⚠️</Text>
                  </View>
                  <View className={styles.warnContent}>
                    <Text className={styles.warnTitle}>超时工单</Text>
                    <Text className={styles.warnDesc}>超出预期处理时间的工单</Text>
                  </View>
                  <Text className={styles.warnCount}>{stats.timeout}</Text>
                </View>
                <View className={styles.warnItem}>
                  <View className={classnames(styles.warnIcon, styles.warning)}>
                    <Text>🔁</Text>
                  </View>
                  <View className={styles.warnContent}>
                    <Text className={styles.warnTitle}>重复故障设备</Text>
                    <Text className={styles.warnDesc}>30天内多次报修的设备</Text>
                  </View>
                  <Text className={styles.warnCount}>{stats.repeatedFaults}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>工单状态分布</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.barChart}>
                <View className={styles.barItem}>
                  <Text className={styles.barLabel}>待接单</Text>
                  <View className={styles.barTrack}>
                    <View
                      className={styles.barFill}
                      style={{ width: `${stats.total > 0 ? (stats.pending / stats.total * 100) : 0}%`, background: 'linear-gradient(90deg, #ff7d00 0%, #ff9a2e 100%)' }}
                    />
                  </View>
                  <Text className={styles.barValue}>{stats.pending}</Text>
                </View>
                <View className={styles.barItem}>
                  <Text className={styles.barLabel}>处理中</Text>
                  <View className={styles.barTrack}>
                    <View
                      className={styles.barFill}
                      style={{ width: `${stats.total > 0 ? (stats.processing / stats.total * 100) : 0}%` }}
                    />
                  </View>
                  <Text className={styles.barValue}>{stats.processing}</Text>
                </View>
                <View className={styles.barItem}>
                  <Text className={styles.barLabel}>已完成</Text>
                  <View className={styles.barTrack}>
                    <View
                      className={styles.barFill}
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total * 100) : 0}%`, background: 'linear-gradient(90deg, #00b42a 0%, #23c343 100%)' }}
                    />
                  </View>
                  <Text className={styles.barValue}>{stats.completed}</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>优先级分布</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.pieLegend}>
                {priorityStats.map(item => (
                  <View key={item.priority} className={styles.legendItem}>
                    <View className={styles.legendDot} style={{ backgroundColor: item.color }} />
                    <Text className={styles.legendText}>{item.label}: {item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      )}

      {activeTab === 'fault' && (
        <>
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>故障类型分布</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.barChart}>
                {faultTypeStats.map(item => (
                  <View key={item.type} className={styles.barItem}>
                    <Text className={styles.barLabel}>{item.type}</Text>
                    <View className={styles.barTrack}>
                      <View
                        className={styles.barFill}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </View>
                    <Text className={styles.barValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>位置分布</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.barChart}>
                {locationStats.map(item => (
                  <View key={item.location} className={styles.barItem}>
                    <Text className={styles.barLabel}>{item.location}</Text>
                    <View className={styles.barTrack}>
                      <View
                        className={styles.barFill}
                        style={{ width: `${item.percentage}%`, background: 'linear-gradient(90deg, #00b42a 0%, #23c343 100%)' }}
                      />
                    </View>
                    <Text className={styles.barValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>重复故障设备排行</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.repeatList}>
                {stats.repeatedFaultAssets.length > 0 ? (
                  stats.repeatedFaultAssets.map((asset, index) => (
                    <View key={index} className={styles.repeatItem}>
                      <View className={classnames(
                        styles.rank,
                        index === 0 && styles.top1,
                        index === 1 && styles.top2,
                        index === 2 && styles.top3,
                        index > 2 && styles.normal
                      )}>
                        <Text>{index + 1}</Text>
                      </View>
                      <View className={styles.assetInfo}>
                        <Text className={styles.assetName}>{asset.name}</Text>
                        <Text className={styles.assetLocation}>{asset.location}</Text>
                      </View>
                      <View className={styles.countInfo}>
                        <Text className={styles.count}>{asset.count}</Text>
                        <Text className={styles.unit}>次</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={{ textAlign: 'center', padding: '40rpx 0' }}>
                    <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无重复故障设备</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </>
      )}

      {activeTab === 'efficiency' && (
        <>
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>维修时效</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.timeStats}>
                <View className={styles.timeStatItem}>
                  <Text className={styles.timeValue}>{stats.avgResponseTime}分</Text>
                  <Text className={styles.timeLabel}>平均响应</Text>
                </View>
                <View className={styles.timeStatItem}>
                  <Text className={styles.timeValue}>{stats.avgRepairTime}分</Text>
                  <Text className={styles.timeLabel}>平均维修</Text>
                </View>
                <View className={styles.timeStatItem}>
                  <Text className={styles.timeValue}>{stats.avgScore}分</Text>
                  <Text className={styles.timeLabel}>平均评分</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>未响应工单明细</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.warnList}>
                {unresponsiveOrders.length > 0 ? (
                  unresponsiveOrders.map(order => (
                    <View key={order.id} className={styles.warnItem}>
                      <View className={classnames(styles.warnIcon, styles.error)}>
                        <Text>⏰</Text>
                      </View>
                      <View className={styles.warnContent}>
                        <Text className={styles.warnTitle}>{order.assetName}</Text>
                        <Text className={styles.warnDesc}>{order.orderNo} · {order.faultType}</Text>
                      </View>
                      <Text className={styles.warnCount} style={{ fontSize: '24rpx' }}>
                        {Math.floor((new Date('2024-06-01 12:00:00').getTime() - new Date(order.applyTime).getTime()) / (1000 * 60 * 60))}h
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={{ textAlign: 'center', padding: '40rpx 0' }}>
                    <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无未响应工单</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>超时工单明细</Text>
            </View>
            <View className={styles.statCard}>
              <View className={styles.warnList}>
                {timeoutOrders.length > 0 ? (
                  timeoutOrders.map(order => (
                    <View key={order.id} className={styles.warnItem}>
                      <View className={classnames(styles.warnIcon, styles.warning)}>
                        <Text>⚠️</Text>
                      </View>
                      <View className={styles.warnContent}>
                        <Text className={styles.warnTitle}>{order.assetName}</Text>
                        <Text className={styles.warnDesc}>{order.orderNo} · {order.faultType}</Text>
                      </View>
                      <Text className={styles.warnCount} style={{ fontSize: '24rpx', color: '#ff7d00' }}>
                        超时
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={{ textAlign: 'center', padding: '40rpx 0' }}>
                    <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无超时工单</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default StatisticsPage;
