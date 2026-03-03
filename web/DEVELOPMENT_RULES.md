# 🛠 核心开发准则 (Development Rules)

> 无论在何处开发，请务必遵守以下“红线”准则，以保持项目的一致性与高水准审美。

## 🎨 视觉红线
1. **配色规范**: 严禁在 CSS 中使用硬编码颜色（如 `color: pink`）。必须使用 `:root` 中定义的变量（如 `var(--color-primary)`）。
2. **布局避让**: 所有新页面必须在根元素设置 `padding-top: 100px` 或更高，以避让 `App.vue` 中固定定位的导航栏。
3. **拒绝扁平**: 任何交互卡片（Card）必须具备 `box-shadow` 和 `hover` 状态下的 `translateY` 位移。
4. **字体一致性**: 保持 `Outfit` 作为主要标题字体，`Inter` 作为正文字体，代码块使用 `Fira Code`。

## 📝 内容准则 (Content Guidelines)
1. **身份定位**: 必须保持“个人开发者”视角进行如实描述。正式品牌名称定为 **AIZO**，寓意“AI + Zone (智能领域)”。
2. **真实性高于艺术性**: 严禁使用“灵魂”、“生命”、“无限可能”等夸张的修辞。内容必须基于 AIZO 创作者的实际经历（如 2020 年转行自学、Vue 3 开发实战）进行描述。
3. **去社交化**: 严禁添加“评论区”、“收藏/分享按钮”、“用户头像”、“作者名”、“点赞数”、“访问量”或“阅读预计时间”。
4. **日期排版**: 详情页日期必须紧跟在大标题下方的左侧，并与分类标签水平对齐。

## � 维护与接力准则 (Maintenance & Sync)
1. **即时记录**: 任何重大改动、功能新增或 Bug 修复，**必须**同步更新 `CONVERSATION_LOG.md`。
2. **要点沉淀**: 新增技术链路或修改数据结构后，**必须**同步更新 `ARCHITECTURE.md`，防止异地同步后的逻辑断层。
3. **审美锚点**: 若 UI 风格发生演进，**必须**更新 `design-system.md` 以确保全局视觉不发散。
4. **自省机制**: 每次跨环境（办公/居家）切换前，请检查最后一次 Commit 或记录，确保“未来的自己”能秒懂当前进度。

## �💻 编程约束
1. **框架版本**: 严格使用 **Vue 3.4+** 的 Composition API (`<script setup>`)。
2. **UI 组件**: 仅限使用 **Element Plus**，严禁引入多余的第三方 UI 库。
3. **滚动加载 (移动端)**: 移动端必须使用 `Intersection Observer` 实现无限滚动。
4. **路由高亮**: 详情页或子页面必须确保顶部导航栏对应的主菜单保持高亮（使用 `path.startsWith` 逻辑）。

---
*保持项目的高级感，源于对约束的坚持。* 🌸🚀


## 📝 Markdown 渲染规范

### 1. 表格渲染问题
**问题:** `marked` v17 默认支持 GFM 表格，但 CSS 样式可能被覆盖导致表格无边框。

**解决方案:** 在渲染 Markdown 后，使用 JavaScript 直接为表格元素添加内联样式：

```javascript
// 渲染 Markdown
renderedContent.value = marked(mdContent)

// 修复表格样式 - 使用内联样式确保显示
const tempDiv = document.createElement('div')
tempDiv.innerHTML = renderedContent.value

const tables = tempDiv.querySelectorAll('table')
tables.forEach(table => {
  table.style.cssText = 'width: 100%; border-collapse: collapse; margin: 1.5rem 0; border: 2px solid #e2e8f0; background: white; display: table;'
  
  const ths = table.querySelectorAll('th')
  ths.forEach(th => {
    th.style.cssText = 'border: 1px solid #cbd5e1; padding: 0.8rem 1rem; text-align: left; display: table-cell; background: linear-gradient(135deg, rgba(244, 114, 182, 0.1), rgba(79, 70, 229, 0.1)); color: #f472b6; font-weight: 700;'
  })
  
  const tds = table.querySelectorAll('td')
  tds.forEach(td => {
    td.style.cssText = 'border: 1px solid #cbd5e1; padding: 0.8rem 1rem; text-align: left; display: table-cell; background: white;'
  })
})

renderedContent.value = tempDiv.innerHTML
```

**原因:** CSS 选择器优先级不足，或被全局样式覆盖。内联样式优先级最高，确保表格正常显示。

### 2. 代码高亮配置
**依赖:** `marked` + `highlight.js`

**配置方式:**
```javascript
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

// 配置 marked
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code(token) {
      const code = token.text
      const language = token.lang
      
      if (language && hljs.getLanguage(language)) {
        const highlighted = hljs.highlight(code, { language }).value
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
      }
      const highlighted = hljs.highlightAuto(code).value
      return `<pre><code class="hljs">${highlighted}</code></pre>`
    }
  }
})
```

**注意事项:**
- `marked` v17 的 `code` renderer 接收 `token` 对象，不是字符串参数
- `token.text` 是代码内容，`token.lang` 是语言标识
- 必须先检查语言是否被 highlight.js 支持

### 3. Markdown 表格语法
**正确格式:**
```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 值1 | 值2 | 值3 |
```

**注意:**
- 表格中的管道符 `|` 在代码块（反引号）内不需要转义
- 分隔行必须至少有 3 个连字符 `---`
- 列对齐：`:---` 左对齐，`:---:` 居中，`---:` 右对齐

### 4. 常见问题排查
1. **表格不显示:** 检查是否有内联样式，使用浏览器开发者工具查看 `display` 属性
2. **代码无高亮:** 检查 `highlight.js` 样式是否正确导入
3. **表格语法错误:** 确保分隔行格式正确，列数一致
