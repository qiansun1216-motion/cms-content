# CMS Content Manager

一个基于 React 和 Material-UI 的 CMS 内容管理系统，功能设计参考 Strapi，支持 Content Type 定义和内容管理。

## 功能特性

### Content Definition 页面
- ✅ 创建和编辑 Content Type
- ✅ 定义字段类型（文本、数字、日期、布尔值、邮箱、URL、多行文本、关系）
- ✅ 字段属性设置（名称、标签、类型、默认值、验证规则）
- ✅ 字段验证（必填、长度限制、数值范围等）
- ✅ 删除 Content Type

### Content 页面
- ✅ 查看 Content Type 的所有内容项
- ✅ 创建新内容项
- ✅ 编辑现有内容项
- ✅ 删除内容项
- ✅ Workflow 支持：
  - 保存后自动变为 `draft` 状态
  - 可以发布内容（`draft` → `published`）
  - 可以取消发布（`published` → `draft`）

## 技术栈

- **React 18** - UI 框架
- **Material-UI (MUI) 5** - UI 组件库
- **React Router 6** - 路由管理
- **Vite** - 构建工具
- **localStorage** - 数据持久化

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/          # 通用组件
│   └── Layout.jsx      # 布局组件
├── pages/              # 页面组件
│   ├── HomePage.jsx    # 首页
│   ├── ContentDefinitionPage.jsx  # Content Definition 页面
│   └── ContentPage.jsx # Content 页面
├── store/              # 状态管理
│   └── contentStore.js # Content 数据存储
├── App.jsx             # 主应用组件
├── main.jsx            # 入口文件
└── index.css           # 全局样式
```

## 使用说明

### 创建 Content Type

1. 点击首页的"创建 Content Type"按钮
2. 填写 Content Type 的名称和描述
3. 点击"添加字段"按钮定义字段
4. 为每个字段设置：
   - 字段名称（唯一标识符）
   - 字段标签（显示名称）
   - 字段类型
   - 是否必填
   - 默认值（可选）
   - 验证规则（根据字段类型不同）
5. 点击"保存"保存 Content Type

### 管理内容

1. 在首页点击 Content Type 卡片上的"查看内容"
2. 点击"创建内容"按钮创建新内容项
3. 表单会根据 Content Type 的字段定义自动生成
4. 填写内容后点击"保存 (保存为草稿)"
5. 内容保存后状态为 `draft`
6. 通过操作菜单可以：
   - 编辑内容
   - 发布内容（`draft` → `published`）
   - 取消发布（`published` → `draft`）
   - 删除内容

## 数据存储

数据使用浏览器的 `localStorage` 进行持久化存储，包括：
- Content Types 定义
- Content 内容项

## 设计特点

- 简洁现代的 Material Design 风格
- 直观的用户界面
- 完整的表单验证
- 响应式设计
- 清晰的状态管理

## 浏览器支持

支持所有现代浏览器（Chrome, Firefox, Safari, Edge）

