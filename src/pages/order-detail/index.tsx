import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import PriorityTag from '@/components/PriorityTag';
import { getOrderById } from '@/data/orders';
import { WorkOrder } from '@/types';
import { useApp } from '@/store/app-context';
import { formatDuration } from '@/utils';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { user } = useApp();
  const [order, setOrder] = useState<WorkOrder | null>(null);

  const orderId = router.params.id || '1';

  useDidShow(() => {
    loadOrder();
  });

  const loadOrder = () => {
    const foundOrder = getOrderById(orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  };

  const handleAccept = () => {
    Taro.showModal({
      title: '确认接单',
      content: '确定要接取此工单吗？',
      confirmText: '确认接单',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '接单成功',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleStartRepair = () => {
    Taro.showToast({
      title: '开始维修',
      icon: 'success'
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '确认完成',
      content: '确定维修已完成？请确认设备已恢复正常。',
      confirmText: '确认完成',
      confirmColor: '#00b42a',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '已提交完成',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleSpareParts = () => {
    Taro.navigateTo({
      url: `/pages/spare-parts/index?orderId=${orderId}`
    });
  };

  const handleEvaluate = () => {
    Taro.navigateTo({
      url: `/pages/evaluation/index?orderId=${orderId}`
    });
  };

  const handlePreviewImage = (current: string) => {
    if (!order) return;
    Taro.previewImage({
      current,
      urls: order.photos
    });
  };

  if (!order) {
    return (
      <View className={styles.page}>
        <View style={{ padding: 100, textAlign: 'center' }}>
          <Text style={{ color: '#86909c' }}>加载中...</Text>
        </View>
      </View>
    );
  }

  const isMaintainer = user.role === 'maintainer' || user.role === 'admin';
  const isEmployee = user.role === 'employee';

  const showAcceptBtn = () => {
    if (order.status === 'pending' && isMaintainer) {
      return true;
    }
    return false;
  };

  const renderBottomBar = () => {
    if (order.status === 'pending' && isMaintainer) {
      return (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.btn, styles.primary)} onClick={handleAccept}>
            <Text className={styles.btnText}>立即接单</Text>
          </View>
        </View>
      );
    }

    if (order.status === 'processing' && isMaintainer) {
      return (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.btn, styles.outline)} onClick={handleSpareParts}>
            <Text className={styles.btnText}>备件申请</Text>
          </View>
          <View className={classnames(styles.btn, styles.success)} onClick={handleComplete}>
            <Text className={styles.btnText}>完成维修</Text>
          </View>
        </View>
      );
    }

    if (order.status === 'completed' && isEmployee && !order.evaluation) {
      return (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.btn, styles.primary)} onClick={handleEvaluate}>
            <Text className={styles.btnText}>去评价</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.sectionBody}>
          <View className={styles.orderHeader}>
            <View>
              <Text className={styles.orderNo}>{order.orderNo}</Text>
              <Text className={styles.orderTime}>提交时间：{order.applyTime}</Text>
            </View>
            <StatusTag status={order.status} />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>📍 设备信息</Text>
          <PriorityTag priority={order.priority} size="sm" />
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.assetInfo}>
            <Text className={styles.assetName}>{order.assetName}</Text>
            <View className={styles.infoRow}>
              <Text className={styles.label}>设备编号</Text>
              <Text className={styles.value}>{order.assetCode}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>所在位置</Text>
              <Text className={styles.value}>{order.location}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>🔧 故障信息</Text>
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.faultInfo}>
            <Text className={styles.faultType}>{order.faultType}</Text>
            <Text className={styles.faultDesc}>{order.faultDescription}</Text>
          </View>
          {order.photos && order.photos.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <View className={styles.photoList}>
                {order.photos.map((photo, index) => (
                  <View key={index} className={styles.photoItem}>
                    <Image
                      className={styles.photo}
                      src={photo}
                      mode="aspectFill"
                      onClick={() => handlePreviewImage(photo)}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>👤 报修人信息</Text>
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.assetInfo}>
            <View className={styles.infoRow}>
              <Text className={styles.label}>报修人</Text>
              <Text className={styles.value}>{order.applicant}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>联系电话</Text>
              <Text className={styles.value}>{order.applicantPhone}</Text>
            </View>
          </View>
        </View>
      </View>

      {(order.status === 'processing' || order.status === 'completed' || order.status === 'closed') && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.title}>🛠️ 维修信息</Text>
          </View>
          <View className={styles.sectionBody}>
            <View className={styles.repairInfo}>
              <View className={styles.infoRow}>
                <Text className={styles.label}>维修人员</Text>
                <Text className={styles.value}>{order.maintainer || '-'}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.label}>接单时间</Text>
                <Text className={styles.value}>{order.acceptTime || '-'}</Text>
              </View>
              {order.diagnosis && (
                <View className={styles.infoRow}>
                  <Text className={styles.label}>故障原因</Text>
                  <Text className={styles.value}>{order.diagnosis}</Text>
                </View>
              )}
              {order.repairSteps && (
                <View className={styles.infoRow}>
                  <Text className={styles.label}>维修步骤</Text>
                  <Text className={styles.value}>{order.repairSteps}</Text>
                </View>
              )}
              {order.downtime !== undefined && order.downtime > 0 && (
                <View className={styles.infoRow}>
                  <Text className={styles.label}>停机时长</Text>
                  <Text className={styles.value}>{formatDuration(order.downtime)}</Text>
                </View>
              )}
              {order.needOutsource !== undefined && (
                <View className={styles.infoRow}>
                  <Text className={styles.label}>是否外协</Text>
                  <Text className={styles.value}>
                    {order.needOutsource ? `是（${order.outsourceCompany || ''}）` : '否'}
                  </Text>
                </View>
              )}
              {order.completedTime && (
                <View className={styles.infoRow}>
                  <Text className={styles.label}>完成时间</Text>
                  <Text className={styles.value}>{order.completedTime}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {order.spareParts && order.spareParts.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.title}>📦 备件申请</Text>
          </View>
          <View className={styles.sectionBody}>
            <View className={styles.spareParts}>
              {order.spareParts.map(part => (
                <View key={part.id} className={styles.partItem}>
                  <View className={styles.partInfo}>
                    <Text className={styles.partName}>{part.name}</Text>
                    <Text className={styles.partMeta}>
                      数量：{part.quantity} | 预计到货：{part.estimatedArrival}
                    </Text>
                  </View>
                  <View
                    className={styles.partStatus}
                    style={{
                      backgroundColor: part.status === 'approved' ? 'rgba(0, 180, 42, 0.1)' : 'rgba(255, 125, 0, 0.1)',
                      color: part.status === 'approved' ? '#00b42a' : '#ff7d00'
                    }}
                  >
                    {part.status === 'approved' ? '已批准' : part.status === 'pending' ? '待审批' : part.status === 'rejected' ? '已拒绝' : '已到货'}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>📋 处理进度</Text>
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.progressTimeline}>
            {order.records && order.records.length > 0 ? (
              order.records.map((record, index) => (
              <View
                key={record.id}
                className={classnames(
                styles.timelineItem,
                index === order.records.length - 1 && styles.done
              )}
            >
              <View className={styles.dot}></View>
              <View className={styles.line}></View>
              <View className={styles.content}>
                <Text className={styles.action}>{record.action}</Text>
                <Text className={styles.description}>{record.description}</Text>
                <Text className={styles.meta}>
                  {record.operator} · {record.timestamp}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ textAlign: 'center', padding: '40rpx 0' }}>
            <Text style={{ color: '#86909c', fontSize: 28 }}>暂无处理记录</Text>
          </View>
        )}
          </View>
        </View>
      </View>

      {order.evaluation && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.title}>⭐ 用户评价</Text>
          </View>
          <View className={styles.sectionBody}>
            <View className={styles.evaluationCard}>
              <View className={styles.scoreRow}>
                <View className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Text key={star} className={styles.star}>
                      {star <= order.evaluation!.score ? '⭐' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text className={styles.scoreText}>
                  {order.evaluation.score}分
                </Text>
              </View>
              <Text className={styles.content}>{order.evaluation.content}</Text>
              <Text className={styles.time}>{order.evaluation.time}</Text>
            </View>
          </View>
        </View>
      )}

      {renderBottomBar()}
    </View>
  );
};

export default OrderDetailPage;
