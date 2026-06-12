import React, { useState } from 'react';
import { View, Text, Image, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useApp } from '@/store/app-context';

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
  const { getOrderById, submitEvaluation, refreshOrders } = useApp();
  const orderId = router.params.orderId || '1';
  const order = getOrderById(orderId);

  const [score, setScore] = useState(order?.evaluation?.score || 0);
  const [hoverScore, setHoverScore] = useState(0);
  const [feedback, setFeedback] = useState(order?.evaluation?.content || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

    const fullContent = selectedTags.length > 0
      ? `${selectedTags.join('、')}${feedback ? '。' + feedback : ''}`
      : (feedback || '用户未填写详细评价');

    Taro.showModal({
      title: '确认提交',
      content: '确认提交评价吗？提交后无法修改。',
      confirmText: '确认提交',
      confirmColor: '#165dff',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' });
          submitEvaluation({
            orderId,
            score,
            content: fullContent
          });
          setTimeout(() => {
            Taro.hideLoading();
            refreshOrders();
            Taro.showToast({
              title: '评价成功',
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

  const displayScore = hoverScore || score;
  const currentLabel = scoreLabels.find(l => l.score === displayScore);

  if (order?.evaluation) {
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
            <Text className={styles.title}>⭐ 我的评价</Text>
          </View>
          <View className={styles.sectionBody}>
            <View style={{
              background: 'linear-gradient(135deg, rgba(22, 93, 255, 0.05) 0%, rgba(64, 128, 255, 0.05) 100%)',
              borderRadius: '12rpx',
              padding: '32rpx'
            }}>
              <View style={{ display: 'flex', alignItems: 'center', marginBottom: '24rpx' }}>
                <View style={{ display: 'flex', gap: '8rpx' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Text key={star} style={{ fontSize: '36rpx' }}>
                      {star <= order.evaluation!.score ? '⭐' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text style={{ marginLeft: '24rpx', fontSize: '28rpx', color: '#4e5969' }}>
                  {order.evaluation.score}分
                </Text>
              </View>
              <Text style={{ fontSize: '28rpx', color: '#4e5969', lineHeight: 1.6 }}>
                {order.evaluation.content}
              </Text>
              <Text style={{ fontSize: '22rpx', color: '#86909c', marginTop: '16rpx', display: 'block' }}>
                {order.evaluation.time}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

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
              src="https://picsum.photos/id/1005/200/200"
              mode="aspectFill"
            />
            <View className={styles.info}>
              <Text className={styles.name}>{order?.maintainer || '维修人员'}</Text>
              <Text className={styles.dept}>设备维护部</Text>
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
