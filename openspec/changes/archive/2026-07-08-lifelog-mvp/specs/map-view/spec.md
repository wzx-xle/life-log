## ADDED Requirements

### Requirement: 地图显示所有已保存店铺
系统 SHALL 显示基于高德地图的主视图，并标记所有已保存的店铺。

#### Scenario: 地图启动时加载标记
- **WHEN** 地图页面加载
- **THEN** 系统 SHALL 从 IndexedDB 加载所有店铺并在地图上显示按分类着色的标记

#### Scenario: 标记颜色匹配店铺分类
- **WHEN** 显示店铺标记
- **THEN** 标记颜色 SHALL 匹配配置的分类颜色方案（餐饮=#FF6B35、住宿=#4A90D9、零售=#52C41A、生活服务=#8B5CF6、娱乐休闲=#F5A623、自定义=#9E9E9E）

#### Scenario: 拒绝定位时默认显示北京
- **WHEN** 用户拒绝定位权限
- **THEN** 地图 SHALL 以北京默认坐标为中心

#### Scenario: 授权定位时居中到用户位置
- **WHEN** 用户授予定位权限
- **THEN** 地图 SHALL 以用户当前 GPS 位置为中心

### Requirement: 用户可以交互式操作店铺标记
系统 SHALL 在点击店铺标记时显示信息卡片。

#### Scenario: 点击标记显示信息卡片
- **WHEN** 用户点击店铺标记
- **THEN** 系统 SHALL 显示卡片，包含店铺名称、平均评分、分类标签，以及"写记录"和"查看详情"按钮

#### Scenario: 点击卡片外部关闭
- **WHEN** 用户点击信息卡片外部区域
- **THEN** 系统 SHALL 关闭卡片

### Requirement: 用户可以搜索地点和地址
系统 SHALL 提供搜索栏查询高德地图 POI 数据。

#### Scenario: 搜索输入显示建议
- **WHEN** 用户在搜索栏输入
- **THEN** 系统 SHALL 防抖处理输入并在下拉列表中显示高德 POI 建议

#### Scenario: 选择建议后地图居中
- **WHEN** 用户选择搜索建议
- **THEN** 系统 SHALL 动画移动地图到选定位置并显示临时高亮标记

### Requirement: 用户可以定位自己
系统 SHALL 提供定位按钮将地图居中到用户当前位置。

#### Scenario: 点击定位按钮居中到 GPS
- **WHEN** 用户点击地图上的定位按钮
- **THEN** 系统 SHALL 动画移动地图到用户当前 GPS 位置并显示蓝色圆点

### Requirement: 用户可以长按添加店铺
系统 SHALL 允许通过在地图上长按来添加店铺。

#### Scenario: 长按显示添加选项
- **WHEN** 用户长按地图空白区域
- **THEN** 系统 SHALL 显示选项"在此位置添加新店铺"

#### Scenario: 选择添加店铺跳转表单
- **WHEN** 用户长按后选择添加店铺选项
- **THEN** 系统 SHALL 跳转到添加店铺表单并预填所选坐标
