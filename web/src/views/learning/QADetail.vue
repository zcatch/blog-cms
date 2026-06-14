<template>
  <div class="qa-detail-page">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <h3>{{ error }}</h3>
      <button class="back-btn" @click="goBack">返回列表</button>
    </div>
    <div v-else class="qa-detail-container">
      <!-- 主内容区 -->
      <div class="qa-detail">
        <!-- 返回按钮 -->
        <div class="meta-top">
          <button class="back-link" @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            <span>返回列表</span>
          </button>
        </div>

        <!-- 问答头部 -->
        <div class="qa-header">
          <h1>{{ qaItem.title }}</h1>
          
          <!-- 分类标签 - 标题下方 -->
          <div class="article-subtitle">
            <el-tag 
              size="small" 
              round 
              class="hero-category-tag"
            >
              {{ getCategoryLabel(qaItem.category) }}
            </el-tag>
          </div>
          
          <!-- 关键词标签 - 底部 -->
          <div class="qa-tags" v-if="qaItem.tags && qaItem.tags.length > 0">
            <span 
              v-for="tag in qaItem.tags.slice(0, 3)" 
              :key="tag" 
              class="keyword-tag"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="divider"></div>

        <!-- Markdown 内容 -->
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>

      <!-- 上下篇导航 - 独立在外面 -->
      <nav class="article-nav">
        <div class="nav-buttons">
          <button v-if="prevItem" @click="goToQA(prevItem)" class="nav-button prev">
            <div class="nav-icon">
              <el-icon><ArrowLeft /></el-icon>
            </div>
            <div class="nav-content">
              <span class="nav-label">上一条</span>
              <span class="nav-title-text">{{ prevItem.title }}</span>
            </div>
          </button>

          <button v-if="nextItem" @click="goToQA(nextItem)" class="nav-button next">
            <div class="nav-content">
              <span class="nav-label">下一条</span>
              <span class="nav-title-text">{{ nextItem.title }}</span>
            </div>
            <div class="nav-icon">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </button>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import qaIndex from './data/qa/index.json'
import 'highlight.js/styles/github-dark.css'

export default {
  name: 'QADetail',
  components: {
    ArrowLeft,
    ArrowRight
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)
    const qaItem = ref(null)
    const renderedContent = ref('')

    // 配置 marked - 添加代码高亮
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

    // 获取当前问答的索引
    const currentIndex = computed(() => {
      return qaIndex.items.findIndex(item => item.id === route.params.id)
    })

    // 上一条和下一条
    const prevItem = computed(() => {
      if (currentIndex.value > 0) {
        return qaIndex.items[currentIndex.value - 1]
      }
      return null
    })

    const nextItem = computed(() => {
      if (currentIndex.value < qaIndex.items.length - 1) {
        return qaIndex.items[currentIndex.value + 1]
      }
      return null
    })

    const loadQA = async () => {
      loading.value = true
      error.value = null

      try {
        // 从索引中找到问答项
        const item = qaIndex.items.find(i => i.id === route.params.id)
        if (!item) {
          error.value = '问答不存在'
          loading.value = false
          return
        }

        qaItem.value = item

        // 动态导入 Markdown 文件
        let mdContent = ''
        
        // 根据文件路径动态导入
        if (item.file === 'categories/linux/qa-001.md') {
          const mdModule = await import('./data/qa/categories/linux/qa-001.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/general/qa-001.md') {
          const mdModule = await import('./data/qa/categories/general/qa-001.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/docker/qa-001.md') {
          const mdModule = await import('./data/qa/categories/docker/qa-001.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/docker/qa-002.md') {
          const mdModule = await import('./data/qa/categories/docker/qa-002.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/docker/qa-003.md') {
          const mdModule = await import('./data/qa/categories/docker/qa-003.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/docker/qa-004.md') {
          const mdModule = await import('./data/qa/categories/docker/qa-004.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/docker/qa-005.md') {
          const mdModule = await import('./data/qa/categories/docker/qa-005.md?raw')
          mdContent = mdModule.default
        } else if (item.file === 'categories/docker/qa-006.md') {
          const mdModule = await import('./data/qa/categories/docker/qa-006.md?raw')
          mdContent = mdModule.default
        } else {
          throw new Error('文件路径不存在')
        }

        // 渲染 Markdown - 确保 mdContent 是字符串
        if (typeof mdContent === 'string') {
          renderedContent.value = marked(mdContent)
        } else {
          throw new Error('Markdown content is not a string')
        }

        // 移除 Markdown 内容中的第一个 h1 标题（避免重复显示）
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = renderedContent.value
        const firstH1 = tempDiv.querySelector('h1')
        if (firstH1) {
          firstH1.remove()
        }
        
        // 修复表格样式 - 使用内联样式确保显示
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

      } catch (err) {
        console.error('Failed to load QA:', err)
        error.value = '加载失败: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const goBack = () => {
      router.push({ name: 'QAList' })
    }

    const goToQA = (item) => {
      router.push({
        name: 'QADetail',
        params: { category: item.category, id: item.id }
      })
    }

    const goToCategory = (categoryKey) => {
      router.push({ 
        name: 'QAList',
        query: { category: categoryKey }
      })
    }

    const getCategoryLabel = (key) => {
      return qaIndex.categories[key]?.label || key
    }

    const getDifficultyLabel = (level) => {
      const labels = {
        1: '⭐ 基础',
        2: '⭐⭐ 进阶',
        3: '⭐⭐⭐ 高级'
      }
      return labels[level] || ''
    }

    // 监听路由变化
    watch(() => route.params.id, () => {
      if (route.name === 'QADetail') {
        loadQA()
        window.scrollTo(0, 0)
      }
    })

    onMounted(() => {
      loadQA()
    })

    return {
      loading,
      error,
      qaItem,
      renderedContent,
      prevItem,
      nextItem,
      categories: qaIndex.categories,
      goBack,
      goToQA,
      goToCategory,
      getCategoryLabel,
      getDifficultyLabel
    }
  }
}
</script>

<style scoped>
.qa-detail-page {
  min-height: 100vh;
  background: #f7f9fc;
  color: #1e293b;
  padding: 2rem;
  padding-top: 90px;
  position: relative;
}

/* Ambient Background */
.qa-detail-page::before,
.qa-detail-page::after {
  content: '';
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  z-index: -1;
  pointer-events: none;
}

.qa-detail-page::before {
  width: 400px;
  height: 400px;
  background: var(--color-primary-3);
  top: -100px;
  right: -50px;
}

.qa-detail-page::after {
  width: 500px;
  height: 500px;
  background: var(--color-secondary-2);
  bottom: 50px;
  left: -150px;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error {
  color: #ef4444;
}

.qa-detail {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.meta-top {
  margin-bottom: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
}

.back-link:hover {
  color: var(--color-primary);
  transform: translateX(-5px);
}

.qa-header {
  margin-bottom: 2rem;
}

.qa-header {
  margin-bottom: 2rem;
}

.qa-header h1 {
  font-size: 2.5rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 800;
  line-height: 1.3;
}

/* 分类标签区域 - 和博客详情一致 */
.article-subtitle { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin-bottom: 2rem; 
}

.hero-category-tag { 
  background: var(--color-primary-1) !important; 
  border: 1px solid var(--color-primary-2) !important; 
  color: var(--color-primary) !important; 
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.hero-category-tag:hover {
  transform: translateY(-2px);
}

/* 关键词标签 - 简洁样式 */
.qa-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 1.5rem;
}

.keyword-tag {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Consolas', monospace;
  transition: color 0.3s;
  cursor: default;
}

.keyword-tag:hover {
  color: var(--color-primary);
}

.divider {
  height: 2px;
  background: linear-gradient(to right, transparent, var(--color-primary-2), var(--color-secondary-2), transparent);
  margin: 2rem 0;
}

/* Markdown 样式 */
.markdown-body {
  color: #1e293b;
  line-height: 1.8;
  font-size: 1.05rem;
}

.markdown-body h1 {
  color: #1e293b;
  font-size: 2rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary-2);
  font-weight: 800;
}

.markdown-body h2 {
  color: #1e293b;
  font-size: 1.6rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-left: 1rem;
  border-left: 4px solid var(--color-primary);
  font-weight: 700;
}

.markdown-body h3 {
  color: var(--color-primary);
  font-size: 1.3rem;
  margin-top: 1.5rem;
  margin-bottom: 0.8rem;
  font-weight: 700;
}

.markdown-body p {
  margin-bottom: 1rem;
  color: #475569;
}

.markdown-body code {
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: var(--color-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.95rem;
  border: 1px solid #e2e8f0;
}

.markdown-body pre {
  background: #1e293b;
  padding: 1.2rem;
  border-radius: 12px;
  overflow-x: auto;
  margin: 1.5rem 0;
  border: 1px solid #334155;
}

.markdown-body pre code {
  background: none;
  padding: 0;
  color: #e2e8f0;
  border: none;
}

/* Markdown 表格样式 - 最高优先级 */
.qa-detail-page .qa-detail .markdown-body table {
  width: 100% !important;
  border-collapse: collapse !important;
  margin: 1.5rem 0 !important;
  border: 2px solid #e2e8f0 !important;
  background: white !important;
  display: table !important;
}

.qa-detail-page .qa-detail .markdown-body thead {
  display: table-header-group !important;
}

.qa-detail-page .qa-detail .markdown-body tbody {
  display: table-row-group !important;
}

.qa-detail-page .qa-detail .markdown-body tr {
  display: table-row !important;
}

.qa-detail-page .qa-detail .markdown-body th,
.qa-detail-page .qa-detail .markdown-body td {
  border: 1px solid #cbd5e1 !important;
  padding: 0.8rem 1rem !important;
  text-align: left !important;
  display: table-cell !important;
  vertical-align: top !important;
  background: white !important;
}

.qa-detail-page .qa-detail .markdown-body th {
  background: linear-gradient(135deg, var(--color-primary-1), var(--color-secondary-1)) !important;
  color: var(--color-primary) !important;
  font-weight: 700 !important;
  border-bottom: 2px solid var(--color-primary-2) !important;
}

.qa-detail-page .qa-detail .markdown-body tbody tr:hover {
  background: #f8fafc !important;
}

.qa-detail-page .qa-detail .markdown-body tbody tr:hover td {
  background: #f8fafc !important;
}

.qa-detail-page .qa-detail .markdown-body tbody tr {
  border-bottom: 1px solid #e2e8f0 !important;
}

.markdown-body ul,
.markdown-body ol {
  margin-left: 2rem;
  margin-bottom: 1rem;
}

.markdown-body li {
  margin-bottom: 0.6rem;
  color: #475569;
}

.markdown-body hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 2rem 0;
}

.markdown-body blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
  font-style: italic;
  background: var(--color-primary-1);
  padding: 1rem;
  border-radius: 8px;
}

.markdown-body a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.qa-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.nav-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  text-align: left;
  font-weight: 600;
}

.nav-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-primary-2);
}

/* Article Navigation - 独立在外面 */
.article-nav {
  max-width: 900px;
  margin: 40px auto 0;
  padding: 0;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 40px;
}

.nav-button {
  flex: 1;
  max-width: 420px;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: white;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.nav-button:hover {
  border-color: var(--color-primary);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.1);
}

.nav-button.prev {
  margin-right: auto;
}

.nav-button.next {
  margin-left: auto;
}

.nav-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.nav-icon .el-icon {
  font-size: 1.2rem;
  color: #94a3b8;
  transition: color 0.3s ease;
}

.nav-button:hover .nav-icon .el-icon {
  color: var(--color-primary);
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  flex: 1;
  min-width: 0;
}

.nav-button.next .nav-content {
  text-align: right;
}

.nav-label {
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-title-text {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s;
}

.nav-button:hover .nav-title-text {
  color: var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .qa-detail-page {
    padding: 1rem;
    padding-top: 80px;
  }

  .qa-detail {
    padding: 2rem 1.5rem;
  }

  .qa-header h1 {
    font-size: 2rem;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 12px;
  }

  .nav-button {
    max-width: 100%;
  }

  .nav-button.prev,
  .nav-button.next {
    margin: 0;
  }

  .nav-button {
    padding: 16px 20px;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  .nav-icon .el-icon {
    font-size: 1.1rem;
  }

  .nav-title-text {
    font-size: 0.9rem;
  }
}
</style>
