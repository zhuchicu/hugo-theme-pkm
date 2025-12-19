
/**
 * 【警告】导入 mermaid.js 未生效
 */

// Mermaid 配置
mermaid.initialize({
    startOnLoad: true,
    theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default',
    securityLevel: 'loose',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
    },
    sequence: {
        useMaxWidth: true,
        height: 50
    },
    gantt: {
        useMaxWidth: true,
        barHeight: 20
    },
    pie: {
        useMaxWidth: true
    }
});

// 下载 SVG
function downloadMermaidSVG(containerId) {
    const container = document.getElementById(containerId);
    const svg = container.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${containerId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 复制代码
async function copyMermaidCode(containerId) {
    const container = document.getElementById(containerId);
    const pre = container.querySelector('.mermaid');
    const code = pre.textContent;
    
    try {
        await navigator.clipboard.writeText(code);
        const btn = container.querySelector('.mermaid-btn:last-child');
        const originalText = btn.textContent;
        btn.textContent = '✅';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('复制失败:', err);
    }
}

// 重新渲染所有 Mermaid 图表
function rerenderMermaid() {
    document.querySelectorAll('.mermaid').forEach(chart => {
        const code = chart.textContent;
        chart.innerHTML = '';
        mermaid.render('mermaid-' + Date.now(), code, (svgCode) => {
            chart.innerHTML = svgCode;
        });
    });
}

// 主题切换时重新渲染
function handleThemeChange() {
    const isDark = document.documentElement.classList.contains('dark') || 
                  document.documentElement.getAttribute('data-theme') === 'dark';
    
    mermaid.initialize({
        theme: isDark ? 'dark' : 'default',
        startOnLoad: false
    });
    
    rerenderMermaid();
}

// 监听主题变化
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme') {
                handleThemeChange();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待 Mermaid 加载完成
    if (typeof mermaid !== 'undefined') {
        mermaid.init();
    }
});