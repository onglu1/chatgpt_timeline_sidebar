/**
 * 公式复制功能模块。
 * 支持在 AI 对话页面中点击公式一键复制 LaTeX / MathML 源码。
 * 通过事件委托（捕获阶段）在 document 上全局监听点击，
 * 自动检测 ChatGPT（KaTeX）、Gemini（data-math）等门户的公式元素。
 */

const FORMULA_COPY_ENABLED_KEY = 'gpt-formula-copy-enabled';
const FORMULA_COPY_FORMAT_KEY = 'gpt-formula-copy-format';

let _formulaCopyEnabled = localStorage.getItem(FORMULA_COPY_ENABLED_KEY) !== 'false';
let _formulaCopyFormat = localStorage.getItem(FORMULA_COPY_FORMAT_KEY) || 'latex';
let _formulaCopyInitialized = false;

// ========== 查找公式元素 ==========

function findMathElement(target) {
    // Gemini: [data-math] 属性
    const dataMathEl = target.closest('[data-math]');
    if (dataMathEl) return dataMathEl;

    // Gemini: .math-inline / .math-block 容器
    const geminiContainer = target.closest('.math-inline, .math-block');
    if (geminiContainer) {
        const inner = geminiContainer.querySelector('[data-math]');
        if (inner) return inner;
        return geminiContainer;
    }

    // ChatGPT/通用 KaTeX: .katex-display 块级公式
    const katexDisplay = target.closest('.katex-display');
    if (katexDisplay) return katexDisplay;

    // ChatGPT/通用 KaTeX: .katex 行内公式
    const katexEl = target.closest('.katex');
    if (katexEl) return katexEl;

    // MathJax
    const mathjaxEl = target.closest('.MathJax, .MathJax_Display, [id^="MathJax"]');
    if (mathjaxEl) return mathjaxEl;

    // 通用: <math> 元素
    const mathNs = target.closest('math');
    if (mathNs) return mathNs;

    return null;
}

// ========== 提取 LaTeX 源码 ==========

function extractLatexSource(element) {
    // data-math 属性（Gemini）
    const dataMath = element.getAttribute('data-math');
    if (dataMath) return dataMath;

    // annotation[encoding="application/x-tex"]（KaTeX / MathJax）
    const texAnnotation = element.querySelector('annotation[encoding="application/x-tex"]');
    if (texAnnotation && texAnnotation.textContent) return texAnnotation.textContent.trim();

    // 兜底：任意 annotation 元素
    const anyAnnotation = element.querySelector('annotation');
    if (anyAnnotation && anyAnnotation.textContent) return anyAnnotation.textContent.trim();

    // MathJax 可能将 LaTeX 存储在 script[type] 中
    const mjScript = element.querySelector('script[type="math/tex"], script[type="math/tex; mode=display"]');
    if (mjScript && mjScript.textContent) return mjScript.textContent.trim();

    return null;
}

// ========== 提取 MathML ==========

function extractMathML(element) {
    const mathEl = element.querySelector('math');
    if (mathEl) {
        const clone = mathEl.cloneNode(true);
        if (!clone.getAttribute('xmlns')) {
            clone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
        }
        return clone.outerHTML;
    }
    // 元素自身就是 <math>
    if (element.tagName && element.tagName.toLowerCase() === 'math') {
        const clone = element.cloneNode(true);
        if (!clone.getAttribute('xmlns')) {
            clone.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');
        }
        return clone.outerHTML;
    }
    return null;
}

// ========== 判断是否为块级公式 ==========

function isDisplayMode(element) {
    if (element.closest('.math-block')) return true;
    if (element.closest('.katex-display')) return true;
    if (element.closest('.MathJax_Display')) return true;
    const mathEl = element.querySelector('math[display="block"]');
    if (mathEl) return true;
    if (element.tagName && element.tagName.toLowerCase() === 'math' &&
        element.getAttribute('display') === 'block') return true;
    return false;
}

// ========== 格式化公式文本 ==========

function formatFormula(latex, mathml, isDisplay) {
    switch (_formulaCopyFormat) {
        case 'latex':
            if (!latex) return null;
            return isDisplay ? `$$${latex}$$` : `$${latex}$`;
        case 'raw':
            return latex || null;
        case 'mathml':
            return mathml || null;
        default:
            return latex || null;
    }
}

// ========== 复制到剪贴板 ==========

async function formulaCopyToClipboard(text, html) {
    if (navigator.clipboard && navigator.clipboard.write) {
        const items = { 'text/plain': new Blob([text], { type: 'text/plain' }) };
        if (html) {
            items['text/html'] = new Blob([html], { type: 'text/html' });
        }
        try {
            await navigator.clipboard.write([new ClipboardItem(items)]);
            return true;
        } catch (_) { /* 降级处理 */ }
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
}

// ========== Toast 提示 ==========

let _toastEl = null;
let _toastTimer = null;

function showFormulaCopyToast(message, x, y, success) {
    if (!_toastEl) {
        _toastEl = document.createElement('div');
        _toastEl.className = 'formula-copy-toast';
        document.body.appendChild(_toastEl);
    }
    clearTimeout(_toastTimer);
    _toastEl.textContent = message;
    _toastEl.className = 'formula-copy-toast ' +
        (success ? 'formula-toast-success' : 'formula-toast-error');
    _toastEl.style.left = `${x}px`;
    _toastEl.style.top = `${y - 40}px`;

    requestAnimationFrame(() => {
        _toastEl.classList.add('formula-toast-show');
    });

    _toastTimer = setTimeout(() => {
        _toastEl.classList.remove('formula-toast-show');
    }, 1500);
}

// ========== 核心点击处理 ==========

function handleFormulaClick(event) {
    if (!_formulaCopyEnabled) return;

    const target = event.target;
    const mathElement = findMathElement(target);
    if (!mathElement) return;

    // 忽略对设置面板自身的点击
    if (target.closest('#gpt-formula-panel') || target.closest('#gpt-formula-btn')) return;

    const latex = extractLatexSource(mathElement);
    const mathml = extractMathML(mathElement);

    if (!latex && !mathml) return;

    const isDisplay = isDisplayMode(mathElement);
    const textToCopy = formatFormula(latex, mathml, isDisplay);

    if (!textToCopy) return;

    // MathML 模式同时写入 text/html
    const htmlContent = (_formulaCopyFormat === 'mathml' && mathml) ? mathml : null;

    formulaCopyToClipboard(textToCopy, htmlContent).then(ok => {
        const formatLabel = { latex: 'LaTeX', raw: 'LaTeX', mathml: 'MathML' }[_formulaCopyFormat] || '';
        showFormulaCopyToast(
            ok ? `${formatLabel} Copied!` : 'Copy failed',
            event.clientX, event.clientY, ok
        );
    });

    event.stopPropagation();
    event.preventDefault();
}

// ========== 公共 API ==========

function initFormulaCopy() {
    if (_formulaCopyInitialized) return;
    document.addEventListener('click', handleFormulaClick, true);
    _formulaCopyInitialized = true;
    if (_formulaCopyEnabled) {
        document.documentElement.classList.add('gpt-formula-copy-active');
    }
}

function setFormulaCopyEnabled(enabled) {
    _formulaCopyEnabled = enabled;
    localStorage.setItem(FORMULA_COPY_ENABLED_KEY, String(enabled));
    if (enabled) {
        document.documentElement.classList.add('gpt-formula-copy-active');
        if (!_formulaCopyInitialized) initFormulaCopy();
    } else {
        document.documentElement.classList.remove('gpt-formula-copy-active');
    }
}

function setFormulaCopyFormat(format) {
    _formulaCopyFormat = format;
    localStorage.setItem(FORMULA_COPY_FORMAT_KEY, format);
}

function getFormulaCopyEnabled() {
    return _formulaCopyEnabled;
}

function getFormulaCopyFormat() {
    return _formulaCopyFormat;
}
