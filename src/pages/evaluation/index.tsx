import React, { useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getOrderById } from '@/data/orders';
import { mockMaintainers } from '@/data/users';

const scoreLabels = [
  { score: 1, label: '很差', icon: '😞' },
  { score: 2, label: '较差', icon: '😕' },
  { score: 3, label: '一般', icon: '😐' },
  { score: 4, label: '满意', icon: '😊' },
  { score: 5, label: '非常满意', icon: '😄' }
];

const quickTags = [
  '响应迅速',
  '技术专业',
  '服务态度好',
  '维修质量高',
  '沟通顺畅',
  '备件及时'
];

const EvaluationPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId || '1';
  const order = getOrderById(orderId);

  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const maintainer = mockMaintainers[0];

  const handleStarClick = (value: number) => {
    setScore(value);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (score === 0) {
      Taro.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: '确认提交评价吗？提交后无法修改。',
      confirmText: '确认提交',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({
              title: '评价成功',
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

  const displayScore = hoverScore || score;
  const currentLabel = scoreLabels.find(l => l.score === displayScore);

  return (
    <View className={styles.page}>
      {order && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.title}>📋 工单信息</Text>
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
                <Text className={styles.label}>完成时间</Text>
                <Text className={styles.value}>{order.completedTime || '-'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.title}>🛠️ 维修人员</Text>
        </View>
        <View className={styles.sectionBody}>
          <View className={styles.repairerInfo}>
            <Image
              className={styles.avatar}
              src={maintainer.avatar}
              mode="aspectFill"
            />
            <View className={styles.info}>
              <Text className={styles.name}>{maintainer.name}</Text>
              <Text className={styles.dept}>{maintainer.department}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionBody}>
          <View className={styles.scoreSection}>
            <Text className={styles.scoreTitle}>请为本次服务打分</Text>
            <View className={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text
                  key={star}
                  className={styles.star}
                  onClick={() => handleStarClick(star)}
                  onTouchStart={() => setHoverScore(star)}
                  onTouchEnd={() => setHoverScore(0)}
                >
                  {star <= displayScore ? '⭐' : '☆'}
                </Text>
              ))}
            </View>
            {currentLabel && (
              <Text className={styles.scoreText}>
                {currentLabel.icon} {currentLabel.label}
              </Text>
            )}
            <View className={styles.scoreLabels}>
              {scoreLabels.map(label => (
                <View key={label.score} className={styles.labelItem}>
                  <Text className={styles.labelIcon}>{label.icon}</Text>
                  <Text className={styles.labelText}>{label.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionBody}>
          <View className={styles.tagsSection}>
            <Text className={styles.tagsTitle}>快捷评价（可多选）</Text>
            <View className={styles.tagsList}>
              {quickTags.map(tag => (
                <View
                  key={tag}
                  className={classnames(
                    styles.tagItem,
                    selectedTags.includes(tag) && styles.active
                  )}
                  onClick={() => handleTagClick(tag)}
                >
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionBody}>
          <View className={styles.feedbackSection}>
            <Text className={styles.feedbackTitle}>详细评价</Text>
            <Textarea
              className={styles.textarea}
              placeholder="请详细描述您的评价和建议..."
              placeholderStyle="color: #c9cdd4"
              value={feedback}
              onInput={(e) => setFeedback(e.detail.value)}
              maxlength={500}
            />
            <Text className={styles.wordCount}>{feedback.length}/500</Text>
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View
          className={classnames(styles.submitBtn, score === 0 && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text className={styles.btnText}>提交评价</Text>
        </View>
      </View>
    </View>
  );
};

export default EvaluationPage;
