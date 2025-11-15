# uniquenames.net 链接追踪指南

**用途**: 追踪在不同渠道发布的链接，分析各渠道的流量质量和转化效果  
**创建日期**: 2025-01-31

---

## 目录

1. [UTM 参数说明](#utm-参数说明)
2. [渠道分类和命名规范](#渠道分类和命名规范)
3. [UTM 链接模板](#utm-链接模板)
4. [如何在 GA4 中查看数据](#如何在-ga4-中查看数据)
5. [HTML 代码集成](#html-代码集成)

---

## UTM 参数说明

### 什么是 UTM 参数？

UTM（Urchin Tracking Module）参数是添加到 URL 末尾的查询字符串，用于追踪流量来源。Google Analytics 会自动识别这些参数并分类流量。

### 标准 UTM 参数

| 参数 | 说明 | 示例 | 是否必需 |
|------|------|------|----------|
| `utm_source` | 流量来源（网站/平台名称） | `reddit`, `facebook`, `babycenter` | ✅ 必需 |
| `utm_medium` | 营销媒介类型 | `social`, `forum`, `referral` | ✅ 必需 |
| `utm_campaign` | 活动名称 | `baby_names_jan2025`, `founder_community` | 推荐 |
| `utm_content` | 内容标识（区分同一活动的不同链接） | `post_1`, `comment_reply` | 可选 |
| `utm_term` | 关键词（主要用于付费广告） | `baby_name_generator` | 可选 |

### UTM 参数命名规范

**原则**:
- 使用小写字母
- 单词之间用下划线（`_`）或连字符（`-`）分隔
- 保持简洁但描述性
- 避免特殊字符
- 保持一致性

**示例**:
- ✅ `utm_source=babycenter` 
- ✅ `utm_source=reddit_r_namenerds`
- ❌ `utm_source=BabyCenter` (避免大写)
- ❌ `utm_source=baby center` (避免空格)

---

## 渠道分类和命名规范

### 渠道分类体系

#### 1. 父母论坛/社区

**utm_medium**: `forum` 或 `community`

**常见平台**:
- BabyCenter
- What to Expect
- Reddit (r/namenerds, r/BabyBumps)
- Facebook 父母群组
- 其他本地父母论坛

**命名示例**:
```
utm_source=babycenter
utm_source=reddit_r_namenerds
utm_source=facebook_parents_group
utm_source=whattoexpect
```

#### 2. 创业者社区

**utm_medium**: `forum` 或 `community`

**常见平台**:
- Reddit (r/startups, r/entrepreneur)
- Indie Hackers
- Product Hunt
- Hacker News
- Facebook 创业者群组
- LinkedIn 群组

**命名示例**:
```
utm_source=reddit_r_startups
utm_source=indie_hackers
utm_source=product_hunt
utm_source=hacker_news
utm_source=linkedin_entrepreneurs
```

#### 3. 社交媒体

**utm_medium**: `social`

**平台**:
- Twitter/X
- Facebook
- LinkedIn
- Instagram
- Reddit (作为社交媒体使用时)

**命名示例**:
```
utm_source=twitter
utm_source=facebook
utm_source=linkedin
utm_source=instagram
```

#### 4. 内容平台

**utm_medium**: `content` 或 `referral`

**平台**:
- Medium
- Substack
- 个人博客
- 其他内容网站

**命名示例**:
```
utm_source=medium
utm_source=substack
utm_source=personal_blog
```

---

## UTM 链接模板

### 基础链接

```
https://uniquenames.net/
```

### 完整 UTM 链接格式

```
https://uniquenames.net/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN&utm_content=CONTENT
```

### 渠道链接模板

#### 模板 1: 父母论坛 - BabyCenter

```
https://uniquenames.net/?utm_source=babycenter&utm_medium=forum&utm_campaign=baby_names_jan2025
```

**使用场景**: 在 BabyCenter 论坛发布关于婴儿起名的帖子

#### 模板 2: Reddit - r/namenerds

```
https://uniquenames.net/?utm_source=reddit_r_namenerds&utm_medium=forum&utm_campaign=baby_names_jan2025&utm_content=post_1
```

**使用场景**: 在 r/namenerds 子版块发布推荐帖子

#### 模板 3: Reddit - r/startups

```
https://uniquenames.net/?utm_source=reddit_r_startups&utm_medium=forum&utm_campaign=founder_naming_jan2025&utm_content=post_1
```

**使用场景**: 在 r/startups 推荐给创业者

#### 模板 4: Indie Hackers

```
https://uniquenames.net/?utm_source=indie_hackers&utm_medium=forum&utm_campaign=founder_naming_jan2025
```

**使用场景**: 在 Indie Hackers 社区分享

#### 模板 5: Product Hunt

```
https://uniquenames.net/?utm_source=product_hunt&utm_medium=referral&utm_campaign=launch_jan2025
```

**使用场景**: Product Hunt 发布或评论

#### 模板 6: Facebook 父母群组

```
https://uniquenames.net/?utm_source=facebook_parents_group&utm_medium=forum&utm_campaign=baby_names_jan2025&utm_content=group_name
```

**使用场景**: 在 Facebook 父母群组分享

#### 模板 7: LinkedIn 创业者群组

```
https://uniquenames.net/?utm_source=linkedin_entrepreneurs&utm_medium=forum&utm_campaign=founder_naming_jan2025
```

**使用场景**: 在 LinkedIn 创业者群组分享

#### 模板 8: Twitter/X

```
https://uniquenames.net/?utm_source=twitter&utm_medium=social&utm_campaign=organic_jan2025&utm_content=tweet_1
```

**使用场景**: Twitter 推文分享

---

## 快速链接生成器

### 使用说明

复制以下模板，替换相应参数即可生成追踪链接。

### 基础模板

```
https://uniquenames.net/?utm_source=[SOURCE]&utm_medium=[MEDIUM]&utm_campaign=[CAMPAIGN]&utm_content=[CONTENT]
```

### 参数替换指南

1. **utm_source**: 替换为具体平台名称
   - 示例: `babycenter`, `reddit_r_namenerds`, `indie_hackers`

2. **utm_medium**: 根据渠道类型选择
   - `forum` - 论坛/社区
   - `social` - 社交媒体
   - `referral` - 推荐/内容平台
   - `email` - 邮件营销（如使用）

3. **utm_campaign**: 活动名称（建议包含日期）
   - 示例: `baby_names_jan2025`, `founder_naming_jan2025`

4. **utm_content**: 区分同一活动的不同链接（可选）
   - 示例: `post_1`, `comment_reply`, `tweet_1`

### 实际使用示例

**场景**: 2025年1月在 Reddit r/namenerds 发布一个推荐帖子

```
https://uniquenames.net/?utm_source=reddit_r_namenerds&utm_medium=forum&utm_campaign=baby_names_jan2025&utm_content=recommendation_post
```

**场景**: 2025年1月在 Indie Hackers 分享给创业者

```
https://uniquenames.net/?utm_source=indie_hackers&utm_medium=forum&utm_campaign=founder_naming_jan2025&utm_content=share_post
```

---

## 如何在 GA4 中查看数据

### 1. 访问 GA4 报告

1. 登录 Google Analytics 4
2. 选择 uniquenames.net 属性
3. 进入 **报告** > **流量获取** > **流量获取概览**

### 2. 查看流量来源

**路径**: 报告 > 流量获取 > 流量获取 > 来源/媒介

这里可以看到：
- `utm_source` 的值（如 `reddit_r_namenerds`）
- `utm_medium` 的值（如 `forum`）
- 每个来源的会话数、用户数、转化数

### 3. 查看活动数据

**路径**: 报告 > 流量获取 > 流量获取 > 广告系列

这里可以看到：
- `utm_campaign` 的值（如 `baby_names_jan2025`）
- 每个活动的效果

### 4. 创建自定义报告

**推荐维度组合**:
- 来源 + 媒介 + 广告系列
- 来源 + 媒介 + 内容

**关键指标**:
- 会话数
- 新用户数
- 跳出率
- 平均会话时长
- 转化率（工具使用）

### 5. 导出数据

可以导出为 CSV 或 Excel，进行进一步分析。

---

## HTML 代码集成

### 1. Google Analytics 4 集成

在 HTML 的 `<head>` 部分添加 GA4 代码：

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**说明**: 
- 将 `G-XXXXXXXXXX` 替换为您的 GA4 Measurement ID
- GA4 会自动识别 UTM 参数，无需额外配置

### 2. 事件追踪（可选）

如果需要追踪特定行为（如工具使用），可以添加事件追踪：

```html
<script>
  // 追踪工具使用
  function trackToolUsage(toolType) {
    gtag('event', 'tool_start', {
      'tool_type': toolType,
      'source': new URLSearchParams(window.location.search).get('utm_source'),
      'medium': new URLSearchParams(window.location.search).get('utm_medium'),
      'campaign': new URLSearchParams(window.location.search).get('utm_campaign')
    });
  }
</script>
```

### 3. 链接点击追踪（可选）

如果需要追踪页面内的链接点击：

```html
<script>
  // 追踪外部链接点击
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    link.addEventListener('click', function() {
      const url = this.href;
      gtag('event', 'click', {
        'event_category': 'outbound',
        'event_label': url,
        'transport_type': 'beacon'
      });
    });
  });
</script>
```

---

## 最佳实践

### 1. 链接管理

**建议**: 创建一个电子表格记录所有发布的链接

| 日期 | 渠道 | 完整链接 | 备注 |
|------|------|----------|------|
| 2025-01-31 | Reddit r/namenerds | https://uniquenames.net/?utm_source=... | 推荐帖子 |
| 2025-02-01 | Indie Hackers | https://uniquenames.net/?utm_source=... | 分享帖子 |

### 2. 命名一致性

- 使用统一的命名规范
- 活动名称包含日期（如 `jan2025`）
- 同一渠道的不同帖子使用 `utm_content` 区分

### 3. 定期检查

- 每周检查一次各渠道的流量数据
- 识别高转化渠道，加大投入
- 识别低效渠道，优化或停止

### 4. A/B 测试

可以测试不同的 `utm_content` 值，看哪个内容更有效：
- `utm_content=post_v1` - 版本1
- `utm_content=post_v2` - 版本2

---

## 常见问题

### Q1: UTM 参数会影响 SEO 吗？

**A**: 不会。UTM 参数是查询字符串，不会影响页面的 SEO。Google 会忽略 UTM 参数进行索引。

### Q2: 用户看到带 UTM 参数的 URL 会反感吗？

**A**: 通常不会。大多数用户不会注意到 URL 中的参数。如果担心，可以使用 URL 缩短服务（如 bit.ly），但会失去一些追踪精度。

### Q3: 同一个链接可以在多个渠道使用吗？

**A**: 可以，但建议为每个渠道创建独立的链接，这样可以更精确地追踪每个渠道的效果。

### Q4: UTM 参数会一直保留在 URL 中吗？

**A**: 是的，除非用户手动删除或使用清理工具。这是正常的，有助于追踪用户来源。

### Q5: 如何追踪用户分享的链接？

**A**: 可以在分享按钮上添加 UTM 参数，例如：
```
https://uniquenames.net/?utm_source=share&utm_medium=social&utm_campaign=user_share
```

---

## 工具推荐

### 1. Google Campaign URL Builder

**网址**: https://ga-dev-tools.google/campaign-url-builder/

**功能**: 可视化生成 UTM 链接

### 2. UTM.io

**网址**: https://utm.io/

**功能**: 更强大的 UTM 链接生成和管理工具

### 3. Excel/Google Sheets

**功能**: 记录和管理所有追踪链接

---

## 下一步

1. **设置 GA4**: 确保 Google Analytics 4 已正确配置
2. **创建链接模板**: 根据常用渠道创建链接模板
3. **开始追踪**: 在发布链接时使用 UTM 参数
4. **定期分析**: 每周/每月分析各渠道数据
5. **优化策略**: 根据数据优化渠道投入

---

**最后更新**: 2025-01-31  
**状态**: 待实施

