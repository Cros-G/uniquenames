/* ============================================
   uniquenames.net - Landing Page JavaScript
   功能：动态效果和交互
   ============================================ */

// ============================================
// 1. H1 标题动态文字自动循环切换
// ============================================

(function initDynamicWord() {
    const dynamicWordElement = document.getElementById('dynamicWord');
    if (!dynamicWordElement) return;
    
    const words = ['Baby', 'Brand', 'Character'];
    let currentIndex = 0;
    const displayDuration = 3000; // 每个词显示 3 秒
    const transitionDuration = 500; // 动画时长 500ms
    
    function switchWord() {
        // 移除之前的类
        dynamicWordElement.classList.remove('fade-in', 'fade-out');
        
        // 淡出当前词
        dynamicWordElement.classList.add('fade-out');
        
        setTimeout(() => {
            // 切换到下一个词
            currentIndex = (currentIndex + 1) % words.length;
            dynamicWordElement.textContent = words[currentIndex];
            
            // 移除淡出类，添加淡入类
            dynamicWordElement.classList.remove('fade-out');
            dynamicWordElement.classList.add('fade-in');
            
            // 动画结束后移除淡入类
            setTimeout(() => {
                dynamicWordElement.classList.remove('fade-in');
            }, transitionDuration);
        }, transitionDuration);
    }
    
    // 页面加载后延迟 1.5 秒开始循环
    setTimeout(() => {
        // 开始循环切换
        setInterval(switchWord, displayDuration);
    }, 1500);
})();

// ============================================
// 2. Use Cases 标签页切换功能
// ============================================

(function initUseCaseTabs() {
    const useCaseTabButtons = document.querySelectorAll('.use-case-tab');
    const useCasePanels = document.querySelectorAll('.use-case-panel');
    
    if (useCaseTabButtons.length === 0 || useCasePanels.length === 0) return;
    
    function switchUseCase(targetUseCase) {
        // 移除所有活动状态
        useCaseTabButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        });
        
        useCasePanels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
        });
        
        // 激活目标标签页
        const targetButton = document.querySelector(`[data-use-case="${targetUseCase}"]`);
        const targetPanel = document.getElementById(`use-case-content-${targetUseCase}`);
        
        if (targetButton && targetPanel) {
            targetButton.classList.add('active');
            targetButton.setAttribute('aria-selected', 'true');
            targetPanel.classList.add('active');
            targetPanel.removeAttribute('hidden');
        }
    }
    
    // 为每个标签按钮添加点击事件
    useCaseTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetUseCase = button.getAttribute('data-use-case');
            if (targetUseCase) {
                switchUseCase(targetUseCase);
            }
        });
        
        // 键盘导航支持
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
})();

// ============================================
// 3. Input Frame 标签页切换功能
// ============================================

(function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    if (tabButtons.length === 0 || tabPanels.length === 0) return;
    
    function switchTab(targetTab) {
        // 移除所有活动状态
        tabButtons.forEach(button => {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
        });
        
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.setAttribute('hidden', '');
        });
        
        // 激活目标标签页
        const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
        const targetPanel = document.getElementById(`${targetTab}-panel`);
        
        if (targetButton && targetPanel) {
            targetButton.classList.add('active');
            targetButton.setAttribute('aria-selected', 'true');
            targetPanel.classList.add('active');
            targetPanel.removeAttribute('hidden');
        }
    }
    
    // 为每个标签按钮添加点击事件
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (targetTab) {
                switchTab(targetTab);
            }
        });
        
        // 键盘导航支持（Enter 和 Space）
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
})();

// ============================================
// 4. FAQ 手风琴展开/折叠功能
// ============================================

(function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    if (faqQuestions.length === 0) return;
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            
            if (!faqItem) return;
            
            const currentState = faqItem.getAttribute('data-state');
            const isExpanded = currentState === 'open';
            
            // 切换状态
            if (isExpanded) {
                // 折叠
                faqItem.setAttribute('data-state', 'closed');
                question.setAttribute('aria-expanded', 'false');
            } else {
                // 展开
                faqItem.setAttribute('data-state', 'open');
                question.setAttribute('aria-expanded', 'true');
            }
        });
        
        // 键盘导航支持（Enter 和 Space）
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
})();

// ============================================
// 4. 表单提交处理 - 跳转到功能页面
// ============================================

(function initForms() {
    const forms = document.querySelectorAll('.input-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const textarea = form.querySelector('.input-textarea');
            const userInput = textarea?.value.trim();
            
            // 验证：用户必须输入内容
            if (!userInput) {
                // 友好提示：聚焦到输入框
                textarea?.focus();
                return;
            }
            
            // 判断当前是哪个标签页
            const isGenerateTab = form.closest('#generate-panel') !== null;
            const targetPath = isGenerateTab ? '/app/generate' : '/app/narrow-down';
            
            // URL 编码用户输入（支持中文、特殊字符）
            const params = new URLSearchParams({ context: userInput });
            
            // 跳转到对应的 React 功能页面
            window.location.href = `${targetPath}?${params.toString()}`;
        });
    });
})();

// ============================================
// 5. 平滑滚动（如果页面有锚点链接）
// ============================================

(function initSmoothScroll() {
    // 浏览器已支持 CSS scroll-behavior: smooth
    // 这里仅为兼容性处理（如果需要）
})();

// ============================================
// 6. 性能优化：图片懒加载（为未来图片准备）
// ============================================

(function initLazyLoading() {
    // 使用 Intersection Observer API 实现图片懒加载
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // 观察所有带有 data-src 属性的图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
})();

// ============================================
// 7. 可访问性增强：焦点管理
// ============================================

(function initFocusManagement() {
    // 确保所有可交互元素都有清晰的焦点指示器
    // CSS 中已处理，这里可以添加额外的 JavaScript 增强
    
    // 为动态内容添加焦点管理
    document.addEventListener('keydown', (e) => {
        // ESC 键关闭展开的 FAQ
        if (e.key === 'Escape') {
            const expandedFAQ = document.querySelector('.faq-question[aria-expanded="true"]');
            if (expandedFAQ) {
                expandedFAQ.click();
                expandedFAQ.focus();
            }
        }
    });
})();

