export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/board/index',
    'pages/orders/index',
    'pages/mine/index',
    'pages/repair-submit/index',
    'pages/order-detail/index',
    'pages/spare-parts/index',
    'pages/evaluation/index',
    'pages/statistics/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '资产维修工单',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/board/index',
        text: '维修看板'
      },
      {
        pagePath: 'pages/orders/index',
        text: '工单'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
