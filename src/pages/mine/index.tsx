import React from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/app-context';
import { UserRole } from '@/types';
import { mockOrders } from '@/data/orders';

const roleMap: Record<UserRole, { label: string; icon: string }> = {
  employee: { label: '员工', icon: '👤' },
  maintainer: { label: '维修人员', icon: '🔧' },
  admin: { label: '管理员', icon: '👑' }
};

const MinePage: React.FC = () => {
  const { user, switchRole } = useApp();

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    Taro.showToast({
      title: `已切换为${roleMap[role].label}`,
      icon: 'success',
      duration: 1500
    });
  };

  const handleStatistics = () => {
    Taro.navigateTo({
      url: '/pages/statistics/index'
    });
  };

  const handleMyOrders = () => {
    Taro.switchTab({
      url: '/pages/orders/index'
    });
  };

  const handleSettings = () => {
    Taro.showToast({
      title: '设置功能开发中',
      icon: 'none'
    });
  };

  const handleAbout = () => {
    Taro.showToast({
      title: '关于功能开发中',
      icon: 'none'
    });
  };

  const stats = {
    total: mockOrders.length,
    unresponsive: mockOrders.filter(o => o.status === 'pending').length,
    timeout: 1,
    repeated: 1,
    satisfaction: 95
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user.avatar || 'https://picsum.photos/id/64/200/200'}
            mode="aspectFill"
          />
          <View className={styles.userDetail}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userDept}>{user.department}</Text>
            <Text className={styles.userRole}>{roleMap[user.role].label}</Text>
          </View>
        </View>
      </View>

      <View className={styles.roleSwitch}>
        <Text className={styles.roleTitle}>角色切换</Text>
        <View className={styles.roleOptions}>
          {(Object.keys(roleMap) as UserRole[]).map(role => (
            <View
              key={role}
              className={classnames(styles.roleOption, user.role === role && styles.active)}
              onClick={() => handleRoleSwitch(role)}
            >
              <Text className={styles.roleIcon}>{roleMap[role].icon}</Text>
              <Text className={styles.roleText}>{roleMap[role].label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>数据统计</Text>
        <View className={styles.statsCard} onClick={handleStatistics}>
          <View className={styles.statsHeader}>
            <Text className={styles.statsTitle}>工单概览</Text>
            <Text className={styles.viewMore}>查看详情 →</Text>
          </View>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats.total}</Text>
              <Text className={styles.statLabel}>总工单数</Text>
            </View>
            <View className={classnames(styles.statItem, styles.warning)}>
              <Text className={styles.statNumber}>{stats.unresponsive}</Text>
              <Text className={styles.statLabel}>未响应</Text>
            </View>
            <View className={classnames(styles.statItem, styles.error)}>
              <Text className={styles.statNumber}>{stats.timeout}</Text>
              <Text className={styles.statLabel}>超时</Text>
            </View>
            <View className={classnames(styles.statItem, styles.error)}>
              <Text className={styles.statNumber}>{stats.repeated}</Text>
              <Text className={styles.statLabel}>重复故障</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats.satisfaction}%</Text>
              <Text className={styles.statLabel}>满意度</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>3.2h</Text>
              <Text className={styles.statLabel}>平均响应</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>功能菜单</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleMyOrders}>
            <View className={styles.menuIcon}>
              <Text className={styles.iconText}>📋</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的工单</Text>
              <Text className={styles.menuDesc}>查看我提交或处理的工单</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={handleStatistics}>
            <View className={styles.menuIcon}>
              <Text className={styles.iconText}>📊</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>统计中心</Text>
              <Text className={styles.menuDesc}>查看详细数据统计</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={handleSettings}>
            <View className={styles.menuIcon}>
              <Text className={styles.iconText}>⚙️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>设置</Text>
              <Text className={styles.menuDesc}>消息通知、隐私设置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={handleAbout}>
            <View className={styles.menuIcon}>
              <Text className={styles.iconText}>ℹ️</Text>
            </View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>关于</Text>
              <Text className={styles.menuDesc}>版本信息、帮助中心</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
