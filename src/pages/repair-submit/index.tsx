import React, { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/app-context';
import { PriorityLevel, Asset } from '@/types';
import { getAssetByCode, mockAssets } from '@/data/assets';

const priorities = [
  { value: 'urgent' as PriorityLevel, name: '紧急', desc: '立即响应' },
  { value: 'high' as PriorityLevel, name: '高', desc: '优先处理' },
  { value: 'medium' as PriorityLevel, name: '中', desc: '正常处理' },
  { value: 'low' as PriorityLevel, name: '低', desc: '延后处理' }
];

const faultTypes = ['机械故障', '电气故障', '软件故障', '设备保养', '其他'];

const RepairSubmitPage: React.FC = () => {
  const router = useRouter();
  const { user } = useApp();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [faultType, setFaultType] = useState('');
  const [faultDescription, setFaultDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [photos, setPhotos] = useState<string[]>([]);

  const mode = router.params.mode || 'manual';

  useEffect(() => {
    if (mode === 'scan') {
      handleScan();
    }
  }, [mode]);

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        const code = res.result;
        const foundAsset = getAssetByCode(code) || mockAssets[0];
        if (foundAsset) {
          setAsset(foundAsset);
          Taro.showToast({
            title: '识别成功',
            icon: 'success'
          });
        } else {
          Taro.showToast({
            title: '未找到该设备',
            icon: 'none'
          });
        }
      },
      fail: () => {
        setAsset(mockAssets[0]);
      }
    });
  };

  const handleChooseAsset = () => {
    Taro.showActionSheet({
      itemList: mockAssets.map(a => `${a.name} (${a.code})`),
      success: (res) => {
        setAsset(mockAssets[res.tapIndex]);
      }
    });
  };

  const handleChooseFaultType = () => {
    Taro.showActionSheet({
      itemList: faultTypes,
      success: (res) => {
        setFaultType(faultTypes[res.tapIndex]);
      }
    });
  };

  const handleUploadPhoto = () => {
    Taro.chooseImage({
      count: 9 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPhotos = [...photos, ...res.tempFilePaths];
        setPhotos(newPhotos.slice(0, 9));
      }
    });
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleSubmit = () => {
    if (!asset) {
      Taro.showToast({ title: '请选择设备', icon: 'none' });
      return;
    }
    if (!faultType) {
      Taro.showToast({ title: '请选择故障类型', icon: 'none' });
      return;
    }
    if (!faultDescription.trim()) {
      Taro.showToast({ title: '请描述故障情况', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: '确认提交报修工单吗？',
      confirmText: '确认提交',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000
            });
            setTimeout(() => {
              Taro.navigateBack();
            }, 2000);
          }, 1000);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.assetInfoCard}>
        <Text className={styles.cardTitle}>📱 设备信息</Text>
        {asset ? (
          <View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>设备名称</Text>
              <Text className={styles.value}>{asset.name}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>设备编号</Text>
              <Text className={styles.value}>{asset.code}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>所在位置</Text>
              <Text className={styles.value}>{asset.location}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.label}>设备类别</Text>
              <Text className={styles.value}>{asset.category}</Text>
            </View>
          </View>
        ) : (
          <View className={styles.scanBtn} onClick={handleScan}>
            <Text className={styles.scanIcon}>📷</Text>
            <Text className={styles.scanText}>扫码选择设备</Text>
          </View>
        )}
        {asset && (
          <View style={{ marginTop: 24, textAlign: 'center' }}>
            <Text
              style={{ color: '#165dff', fontSize: 26 }}
              onClick={handleChooseAsset}
            >
              更换设备
            </Text>
          </View>
        )}
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>故障信息</Text>

        <View className={styles.formItem} onClick={handleChooseFaultType}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>故障类型
          </Text>
          <View className={styles.selectRow}>
            <Text className={styles.selectText}>
              {faultType || '请选择故障类型'}
            </Text>
            <Text className={styles.arrow}>›</Text>
          </View>
        </View>

        <View className={styles.textareaItem}>
          <Text className={styles.label}>
            <Text className={styles.required}>*</Text>故障描述
          </Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述故障情况，包括故障现象、发生时间、影响范围等"
            value={faultDescription}
            onInput={(e) => setFaultDescription(e.detail.value)}
            maxlength={500}
          />
          <Text className={styles.wordCount}>{faultDescription.length}/500</Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>照片上传</Text>
        <View className={styles.photoUpload}>
          <View className={styles.photoList}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image
                  className={styles.photo}
                  src={photo}
                  mode="aspectFill"
                  onClick={() => {
                    Taro.previewImage({
                      current: photo,
                      urls: photos
                    });
                  }}
                />
                <View className={styles.deleteBtn} onClick={() => handleDeletePhoto(index)}>
                  <Text>×</Text>
                </View>
              </View>
            ))}
            {photos.length < 9 && (
              <View className={styles.addBtn} onClick={handleUploadPhoto}>
                <Text className={styles.addIcon}>+</Text>
                <Text className={styles.addText}>上传照片</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>紧急程度</Text>
        <View className={styles.priorityList}>
          {priorities.map(p => (
            <View
              key={p.value}
              className={classnames(
                styles.priorityItem,
                styles[p.value],
                priority === p.value && styles.active
              )}
              onClick={() => setPriority(p.value)}
            >
              <Text className={styles.priorityName}>{p.name}</Text>
              <Text className={styles.priorityDesc}>{p.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>报修人信息</Text>
        <View className={styles.formItem}>
          <Text className={styles.label}>报修人</Text>
          <View className={styles.inputWrap}>
            <Text className={styles.input}>{user.name}</Text>
          </View>
        </View>
        <View className={styles.formItem}>
          <Text className={styles.label}>联系电话</Text>
          <View className={styles.inputWrap}>
            <Text className={styles.input}>{user.phone}</Text>
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(
            styles.submitBtn,
            (!asset || !faultType || !faultDescription.trim()) && styles.disabled
          )}
          onClick={handleSubmit}
        >
          <Text className={styles.btnText}>提交报修</Text>
        </View>
      </View>
    </View>
  );
};

export default RepairSubmitPage;
