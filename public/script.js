// Toast 通知系统
class Toast {
  constructor() {
    this.container = document.getElementById('toastContainer');
  }

  show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.success}</span>
      <span class="toast-message">${message}</span>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }
}

// 弹窗系统
class Modal {
  constructor() {
    this.overlay = document.getElementById('modalOverlay');
    this.title = document.getElementById('modalTitle');
    this.body = document.getElementById('modalBody');
    this.confirmBtn = document.getElementById('modalConfirmBtn');
    this.cancelBtn = document.getElementById('modalCancelBtn');
    this.closeBtn = document.getElementById('modalClose');

    this.closeBtn.addEventListener('click', () => this.hide());
    this.cancelBtn.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }

  show(title, content, onConfirm) {
    this.title.textContent = title;
    this.body.innerHTML = content;
    this.overlay.style.display = 'flex';

    this.confirmBtn.onclick = () => {
      if (onConfirm) onConfirm();
      this.hide();
    };
  }

  hide() {
    this.overlay.style.display = 'none';
  }
}

// 初始化
const toast = new Toast();
const modal = new Modal();

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');

// 上传区域点击事件
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// 文件选择事件
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    handleFileUpload(file);
  }
});

// 拖拽上传
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleFileUpload(file);
  } else {
    toast.error('请上传图片文件');
  }
});

// 处理文件上传
async function handleFileUpload(file) {
  // 验证文件大小
  if (file.size > 10 * 1024 * 1024) {
    toast.error('文件大小不能超过 10MB');
    return;
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    toast.error('只支持图片格式文件');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    loadingOverlay.style.display = 'flex';

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      displayResults(data);
      toast.success('岩心分析完成');
    } else {
      throw new Error(data.error || '分析失败');
    }
  } catch (error) {
    console.error('上传错误:', error);
    toast.error(error.message || '上传失败，请重试');
  } finally {
    loadingOverlay.style.display = 'none';
  }
}

// 显示分析结果
function displayResults(data) {
  const { image, analysis } = data;

  // 显示结果区域
  resultsSection.style.display = 'block';
  document.querySelector('.upload-section').style.display = 'none';

  // 显示图片
  const previewImage = document.getElementById('previewImage');
  previewImage.src = image.url;

  // 显示图片信息
  const imageInfo = document.getElementById('imageInfo');
  imageInfo.innerHTML = `
    <span>文件名: ${image.filename}</span>
    <span>尺寸: ${image.dimensions.width} × ${image.dimensions.height}</span>
    <span>大小: ${formatFileSize(image.size)}</span>
  `;

  // 显示岩性识别结果
  displayLithology(analysis.lithology);

  // 显示构造分析结果
  displayStructures(analysis.structures);

  // 显示沉积相判断结果
  displayFacies(analysis.facies);
}

// 显示岩性识别
function displayLithology(lithology) {
  const container = document.getElementById('lithologyResult');

  const primaryHtml = `
    <div class="lithology-item lithology-primary">
      <div class="lithology-header">
        <span class="lithology-name">${lithology.primary.name}</span>
        <span class="confidence-badge">${(lithology.primary.confidence * 100).toFixed(0)}%</span>
      </div>
      <div class="lithology-details">
        <div class="detail-row">
          <span class="detail-label">颜色:</span>
          <span class="detail-value">${lithology.primary.color}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">粒度:</span>
          <span class="detail-value">${lithology.primary.grain}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">特征:</span>
          <span class="detail-value">${lithology.primary.features}</span>
        </div>
      </div>
    </div>
  `;

  const secondaryHtml = lithology.secondary.map(item => `
    <div class="lithology-item">
      <div class="lithology-header">
        <span class="lithology-name">${item.name}</span>
        <span class="confidence-badge" style="background: var(--secondary-color);">${(item.confidence * 100).toFixed(0)}%</span>
      </div>
      <div class="lithology-details">
        <div class="detail-row">
          <span class="detail-label">颜色:</span>
          <span class="detail-value">${item.color}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">粒度:</span>
          <span class="detail-value">${item.grain}</span>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = `
    <h4 style="margin-bottom: 12px; color: var(--text-secondary); font-size: 0.95rem;">主要岩性</h4>
    ${primaryHtml}
    ${lithology.secondary.length > 0 ? `
      <h4 style="margin: 20px 0 12px; color: var(--text-secondary); font-size: 0.95rem;">次要岩性</h4>
      ${secondaryHtml}
    ` : ''}
  `;
}

// 显示构造分析
function displayStructures(structures) {
  const container = document.getElementById('structureResult');

  const html = structures.map(struct => `
    <div class="structure-item">
      <div class="structure-type">${struct.type}</div>
      <div class="structure-subtype">${struct.subtype}</div>
      <div class="structure-desc">${struct.description}</div>
    </div>
  `).join('');

  container.innerHTML = `<div class="structure-list">${html}</div>`;
}

// 显示沉积相判断
function displayFacies(facies) {
  const container = document.getElementById('faciesResult');

  const primaryHtml = `
    <div class="facies-primary">
      <div class="facies-name">${facies.primary.name}</div>
      <div class="facies-subtype">${facies.primary.subtype}</div>
      <div class="facies-confidence">置信度: ${(facies.confidence * 100).toFixed(0)}%</div>
      <div class="facies-details">
        <div class="facies-detail-row">
          <span class="facies-detail-label">沉积环境:</span>
          <span>${facies.primary.environment}</span>
        </div>
        <div class="facies-detail-row">
          <span class="facies-detail-label">主要特征:</span>
          <span>${facies.primary.characteristics}</span>
        </div>
        <div class="facies-detail-row">
          <span class="facies-detail-label">储层潜力:</span>
          <span>${facies.primary.oilPotential}</span>
        </div>
      </div>
    </div>
  `;

  const alternativesHtml = facies.alternatives.length > 0 ? `
    <h4 style="margin: 20px 0 12px; color: var(--text-secondary);">可能的其他沉积相</h4>
    <div class="facies-alternatives">
      ${facies.alternatives.map(alt => `
        <div class="facies-alt-item">
          <div class="facies-alt-name">${alt.name}</div>
          <div class="facies-alt-subtype">${alt.subtype}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = primaryHtml + alternativesHtml;
}

// 新建分析
newAnalysisBtn.addEventListener('click', () => {
  modal.show(
    '新建分析',
    '<p>确定要开始新的岩心分析吗？当前结果将被清除。</p>',
    () => {
      resultsSection.style.display = 'none';
      document.querySelector('.upload-section').style.display = 'block';
      fileInput.value = '';
      toast.success('已清除当前分析结果');
    }
  );
});

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 页面加载完成
document.addEventListener('DOMContentLoaded', () => {
  console.log('岩心描述与分析系统已加载');
});