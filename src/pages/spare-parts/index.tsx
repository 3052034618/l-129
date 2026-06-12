import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/app-context';

interface PartItem {
  id: string;
  name: string;
  quantity: number;
  estimatedArrival: string;
}

const SparePartsPage: React.FC = () => {
  const router = useRouter();
  const { user, getOrderById, addSpareParts, refreshOrders } = useApp();
  const orderId = router.params.orderId || '1';
  const order = getOrderById(orderId);

  const [parts, setParts] = useState<PartItem[]>([
    {
      id: '1',
      name: '',
      quantity: 1,
      estimatedArrival: ''
    }
  ]);

  const handlePartNameChange = (id: string, value: string) => {
    setParts(prev => prev.map(p =>
      p.id === id ? { ...p, name: value } : p
    ));
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setParts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newQty = Math.max(1, p.quantity + delta);
      return { ...p, quantity: newQty };
    }));
  };

  const handleDateChange = (id: string, value: string) => {
    setParts(prev => prev.map(p =>
      p.id === id ? { ...p, estimatedArrival: value } : p
    ));
  };

  const handleDatePick = (id: string) => {
    Taro.showActionSheet({
      itemList: ['1天内', '3天内', '7天内', '15天内', '30天内'],
      success: (res) => {
        const days = [1, 3, 7, 15, 30];
        const today = new Date();
        today.setDate(today.getDate() + days[res.tapIndex]);
        const dateStr = today.toISOString().split('T')[0];
        handleDateChange(id, dateStr);
      }
    });
  };

  const handleAddPart = () => {
    if (parts.length >= 5) {
      Taro.showToast({ title: '最多添加5个备件', icon: 'none' });
      return;
    }
    const newPart: PartItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      estimatedArrival: ''
    };
    setParts([...parts, newPart]);
  };

  const handleDeletePart = (id: string) => {
    if (parts.length <= 1) {
      Taro.showToast({ title: '至少保留一个备件', icon: 'none' });
      return;
    }
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    const invalidParts = parts.filter(p => !p.name.trim() || !p.estimatedArrival);
    if (invalidParts.length > 0) {
      Taro.showToast({ title: '请完善所有备件信息', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: `确定提交 ${parts.length} 个备件申请吗？`,
      confirmText: '确认提交',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          addSpareParts({
            orderId,
            parts: parts.map(p => ({
              name: p.name.trim(),
              quantity: p.quantity,
              estimatedArrival: p.estimatedArrival
            })),
            applicant: user.name
          });
          setTimeout(() => {
            Taro.hideLoading();
            refreshOrders();
            Taro.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 1500
            });
            setTimeout(() => {
              Taro.navigateBack();
            }, 1500);
          }, 800);
        }
      }
    });
  };

  const canSubmit = parts.length > 0 && parts.every(p => p.name.trim() && p.estimatedArrival);

  return (
    <View className={styles.page}>
      {order && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.title}>📋 关联工单</Text>
          </View>
          <View className={styles.sectionBody}>
            <View className={styles.orderInfo}>
              <View className={styles.infoRow}>
                <Text className={styles.label}>工单编号</Text>
                <Text className={styles.value}>{order.orderNo}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.label}>设备名称</Text>
                <Text className={styles.value}>{order.assetName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.label}>设备位置</Text>
                <Text className={styles.value}>{order.location}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {order && order.spareParts && order.spareParts.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.title}>📦 已有备件</Text>
          </View>
          <View className={styles.sectionBody}>
            <View className={styles.partsList}>
              {order.spareParts.map(part => (
                <View key={part.id} className={styles.partItem} style={{ paddingBottom: 0, borderBottom: '1rpx solid #f2f3f5' }}>
                  <View className={styles.partInfo}>
                    <View style={{ fontSize: '28rpx', fontWeight: 500, color: '#1d2129', marginBottom: '8rpx' }}>
                      {part.name}
                    </View>
                    <View style={{ fontSize: '24rpx', color: '#86909c' }}>
                      数量：{part.quantity} | 预计到货：{part.estimatedArrival}
                    </View>
                  </View>
                  <View
                    style={{
                      fontSize: '24rpx',
                      padding: '4rpx 16rpx',
                      borderRadius: '4rpx',
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
          <Text className={styles.title}>📦 新增备件清单</Text>
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.partsList}>
            {parts.map((part, index) => (
              <View key={part.id} className={styles.partItem}>
                <View className={styles.partInfo}>
                  <View className={styles.formItem} style={{ padding: 0, border: 'none' }}>
                    <Text className={styles.label} style={{ width: 'auto' }}>
                      <Text className={styles.required}>*</Text>
                      备件{index + 1}
                    </Text>
                    <View className={styles.inputWrap}>
                      <Input
                        className={classnames(styles.input, styles.inputLeft)}
                        placeholder="请输入备件名称"
                        placeholderClass={styles.placeholder}
                        value={part.name}
                        onInput={(e) => handlePartNameChange(part.id, e.detail.value)}
                      />
                    </View>
                  </View>

                  <View className={styles.formItem} style={{ padding: '16rpx 0 0', border: 'none' }}>
                    <Text className={styles.label} style={{ width: 'auto' }}>数量</Text>
                    <View className={styles.quantityControl}>
                      <View
                        className={classnames(styles.qtyBtn, part.quantity <= 1 && styles.disabled)}
                        onClick={() => handleQuantityChange(part.id, -1)}
                      >
                        <Text>-</Text>
                      </View>
                      <Text className={styles.qtyValue}>{part.quantity}</Text>
                      <View
                        className={styles.qtyBtn}
                        onClick={() => handleQuantityChange(part.id, 1)}
                      >
                        <Text>+</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.formItem} style={{ padding: '16rpx 0 0', border: 'none' }} onClick={() => handleDatePick(part.id)}>
                    <Text className={styles.label} style={{ width: 'auto' }}>
                      <Text className={styles.required}>*</Text>
                      预计到货
                    </Text>
                    <View className={styles.selectRow}>
                      <Text className={styles.selectText}>
                        {part.estimatedArrival || '请选择'}
                      </Text>
                      <Text className={styles.arrow}>›</Text>
                    </View>
                  </View>
                </View>
                <View className={styles.deleteBtn} onClick={() => handleDeletePart(part.id)}>
                  <Text className={styles.deleteText}>×</Text>
                </View>
              </View>
            ))}
          </View>

          <View className={styles.addPartBtn} onClick={handleAddPart}>
            <Text className={styles.addIcon}>+</Text>
            <Text className={styles.addText}>添加备件</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>👤 申请人信息</Text>
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.formItem} style={{ padding: 0, border: 'none' }}>
            <Text className={styles.label}>申请人</Text>
            <View className={styles.inputWrap}>
              <Text className={styles.input}>{user.name}</Text>
            </View>
          </View>
          <View className={styles.formItem} style={{ padding: '24rpx 0 0', border: 'none' }}>
            <Text className={styles.label}>联系电话</Text>
            <View className={styles.inputWrap}>
              <Text className={styles.input}>{user.phone}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text className={styles.btnText}>提交申请</Text>
        </View>
      </View>
    </View>
  );
};

export default SparePartsPage;
