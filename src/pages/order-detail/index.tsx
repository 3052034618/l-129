import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatusTag from '@/components/StatusTag';
import PriorityTag from '@/components/PriorityTag';
import { useApp } from '@/store/app-context';
import { formatDuration } from '@/utils';
import { mockMaintainers } from '@/data/users';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { user, orders, acceptOrder, completeRepair, transferOrder, refreshOrders } = useApp();
  const [showRepairModal, setShowRepairModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [repairSteps, setRepairSteps] = useState('');
  const [downtime, setDowntime] = useState(0);
  const [needOutsource, setNeedOutsource] = useState(false);
  const [outsourceCompany, setOutsourceCompany] = useState('');
  const [selectedMaintainer, setSelectedMaintainer] = useState('');

  const orderId = router.params.id || '1';

  useDidShow(() => {
    refreshOrders();
  });

  const order = useMemo(() => {
    return orders.find(o => o.id === orderId) || null;
  }, [orders, orderId]);

  const handleAccept = () => {
    Taro.showModal({
      title: '确认接单',
      content: '确定要接取此工单吗？',
      confirmText: '确认接单',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          acceptOrder({
            orderId,
            maintainer: user.name
          });
          Taro.showToast({
            title: '接单成功',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleOpenRepairModal = () => {
    if (order) {
      setDiagnosis(order.diagnosis || '');
      setRepairSteps(order.repairSteps || '');
      setDowntime(order.downtime || 0);
      setNeedOutsource(order.needOutsource || false);
      setOutsourceCompany(order.outsourceCompany || '');
    }
    setShowRepairModal(true);
  };

  const handleCloseRepairModal = () => {
    setShowRepairModal(false);
  };

  const handleDowntimeChange = (delta: number) => {
    setDowntime(prev => Math.max(0, prev + delta));
  };

  const handleComplete = () => {
    if (!diagnosis.trim()) {
      Taro.showToast({ title: '请填写排查原因', icon: 'none' });
      return;
    }
    if (!repairSteps.trim()) {
      Taro.showToast({ title: '请填写维修步骤', icon: 'none' });
      return;
    }
    if (needOutsource && !outsourceCompany.trim()) {
      Taro.showToast({ title: '请填写外协公司', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认完成',
      content: '确定维修已完成？请确认设备已恢复正常。',
      confirmText: '确认完成',
      confirmColor: '#00b42a',
      success: (res) => {
        if (res.confirm) {
          completeRepair({
            orderId,
            diagnosis: diagnosis.trim(),
            repairSteps: repairSteps.trim(),
            downtime,
            needOutsource,
            outsourceCompany: needOutsource ? outsourceCompany.trim() : undefined
          });
          setShowRepairModal(false);
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

  const handleOpenTransferModal = () => {
    setSelectedMaintainer('');
    setShowTransferModal(true);
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setSelectedMaintainer('');
  };

  const handleSelectMaintainer = (name: string) => {
    setSelectedMaintainer(name);
  };

  const handleConfirmTransfer = () => {
    if (!selectedMaintainer) {
      Taro.showToast({ title: '请选择接收人', icon: 'none' });
      return;
    }
    if (!order) return;
    Taro.showModal({
      title: '确认转派',
      content: `确定要将此工单转派给 ${selectedMaintainer} 吗？`,
      confirmColor: '#ff7d00',
      success: (res) => {
        if (res.confirm) {
          transferOrder({
            orderId,
            fromMaintainer: order.maintainer || user.name,
            toMaintainer: selectedMaintainer
          });
          Taro.showToast({ title: '转派成功', icon: 'success' });
          setShowTransferModal(false);
          setSelectedMaintainer('');
        }
      }
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
          <View className={classnames(styles.btn, styles.outline, styles.small)} onClick={handleSpareParts}>
            <Text className={styles.btnText}>备件申请</Text>
          </View>
          <View className={classnames(styles.btn, styles.warning, styles.small)} onClick={handleOpenTransferModal}>
            <Text className={styles.btnText}>转派</Text>
          </View>
          <View className={classnames(styles.btn, styles.success, styles.small)} onClick={handleOpenRepairModal}>
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
              {order.downtime !== undefined && (
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

      {showRepairModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>填写维修结果</Text>
              <View className={styles.closeBtn} onClick={handleCloseRepairModal}>
                <Text>×</Text>
              </View>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              <View className={styles.formItem}>
                <Text className={styles.label}>
                  <Text className={styles.required}>*</Text>排查原因
                </Text>
                <View className={styles.textareaWrap}>
                  <Textarea
                    className={styles.textarea}
                    placeholder="请填写故障排查结果和原因分析"
                    placeholderStyle="color: #c9cdd4"
                    value={diagnosis}
                    onInput={(e) => setDiagnosis(e.detail.value)}
                    maxlength={500}
                  />
                </View>
                <Text className={styles.wordCount}>{diagnosis.length}/500</Text>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>
                  <Text className={styles.required}>*</Text>维修步骤
                </Text>
                <View className={styles.textareaWrap}>
                  <Textarea
                    className={styles.textarea}
                    placeholder="请详细描述维修操作步骤"
                    placeholderStyle="color: #c9cdd4"
                    value={repairSteps}
                    onInput={(e) => setRepairSteps(e.detail.value)}
                    maxlength={1000}
                  />
                </View>
                <Text className={styles.wordCount}>{repairSteps.length}/1000</Text>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>停机时长（分钟）</Text>
                <View className={styles.inputWrap}>
                  <View className={styles.quantityControl}>
                    <View
                      className={classnames(styles.qtyBtn, downtime <= 0 && styles.disabled)}
                      onClick={() => handleDowntimeChange(-10)}
                    >
                      <Text>-10</Text>
                    </View>
                    <View
                      className={classnames(styles.qtyBtn, downtime <= 0 && styles.disabled)}
                      onClick={() => handleDowntimeChange(-1)}
                    >
                      <Text>-</Text>
                    </View>
                    <Text className={styles.qtyValue}>{downtime}</Text>
                    <View className={styles.qtyBtn} onClick={() => handleDowntimeChange(1)}>
                      <Text>+</Text>
                    </View>
                    <View className={styles.qtyBtn} onClick={() => handleDowntimeChange(10)}>
                      <Text>+10</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.label}>是否需要外协</Text>
                <View className={styles.switchRow}>
                  <Text className={styles.switchLabel}>
                    {needOutsource ? '是' : '否'}
                  </Text>
                  <View
                    className={classnames(styles.switchBtn, needOutsource && styles.on)}
                    onClick={() => setNeedOutsource(!needOutsource)}
                  />
                </View>
              </View>

              {needOutsource && (
                <View className={styles.formItem}>
                  <Text className={styles.label}>
                    <Text className={styles.required}>*</Text>外协公司名称
                  </Text>
                  <View className={styles.inputWrap}>
                    <Input
                      className={styles.input}
                      placeholder="请输入外协公司名称"
                      placeholderClass="placeholder"
                      value={outsourceCompany}
                      onInput={(e) => setOutsourceCompany(e.detail.value)}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={classnames(styles.btn, styles.outline)} onClick={handleCloseRepairModal}>
                <Text className={styles.btnText}>取消</Text>
              </View>
              <View className={classnames(styles.btn, styles.success)} onClick={handleComplete}>
                <Text className={styles.btnText}>确认完成</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showTransferModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择接收维修人员</Text>
              <View className={styles.closeBtn} onClick={handleCloseTransferModal}>
                <Text>×</Text>
              </View>
            </View>
            <ScrollView scrollY className={styles.modalBody}>
              {mockMaintainers.map(m => (
                <View
                  key={m.id}
                  className={classnames(
                    styles.maintainerItem,
                    selectedMaintainer === m.name && styles.selected,
                    order?.maintainer === m.name && styles.disabled
                  )}
                  onClick={() => {
                    if (order?.maintainer !== m.name) {
                      handleSelectMaintainer(m.name);
                    }
                  }}
                >
                  <View className={styles.maintainerInfo}>
                    <Text className={styles.maintainerName}>{m.name}</Text>
                    <Text className={styles.maintainerDept}>{m.department}</Text>
                  </View>
                  {order?.maintainer === m.name && (
                    <Text className={styles.currentTag}>当前</Text>
                  )}
                  {selectedMaintainer === m.name && order?.maintainer !== m.name && (
                    <Text className={styles.checkIcon}>✓</Text>
                  )}
                </View>
              ))}
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={classnames(styles.btn, styles.outline)} onClick={handleCloseTransferModal}>
                <Text className={styles.btnText}>取消</Text>
              </View>
              <View className={classnames(styles.btn, styles.warning)} onClick={handleConfirmTransfer}>
                <Text className={styles.btnText}>确认转派</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;
