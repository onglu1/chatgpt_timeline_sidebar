/**
 * Shared UI creation for LLM Chat Navigator.
 * Creates sidebar, float controls, and outline panel DOM elements.
 * All variables are global so main.js can access them.
 */

const sidebar = document.createElement('div');
sidebar.id = 'gpt-prompt-sidebar';
sidebar.className = 'collapsed';

const header = document.createElement('div');
header.id = 'gpt-sidebar-header';

const title = document.createElement('div');
title.id = 'gpt-sidebar-title';
title.innerText = 'Prompts';

header.appendChild(title);
sidebar.appendChild(header);

const promptList = document.createElement('div');
promptList.id = 'gpt-prompt-list';
sidebar.appendChild(promptList);

const floatControls = document.createElement('div');
floatControls.id = 'gpt-float-controls';

const toggleBtn = document.createElement('button');
toggleBtn.className = 'gpt-float-btn';
toggleBtn.id = 'gpt-toggle-btn';
toggleBtn.title = '展开/折叠侧边栏';
toggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>`;

const upBtn = document.createElement('button');
upBtn.className = 'gpt-float-btn';
upBtn.id = 'gpt-nav-up';
upBtn.title = '上一个 Prompt';
upBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;

const downBtn = document.createElement('button');
downBtn.className = 'gpt-float-btn';
downBtn.id = 'gpt-nav-down';
downBtn.title = '下一个 Prompt';
downBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

const outlineToggleBtn = document.createElement('button');
outlineToggleBtn.className = 'gpt-float-btn active';
outlineToggleBtn.id = 'gpt-outline-toggle';
outlineToggleBtn.title = '显示/隐藏大纲';
outlineToggleBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>`;

const formulaBtn = document.createElement('button');
formulaBtn.className = 'gpt-float-btn';
formulaBtn.id = 'gpt-formula-btn';
formulaBtn.title = '公式复制设置';
formulaBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 4 6 4 12 12 6 20 18 20"/></svg>`;

floatControls.appendChild(toggleBtn);
floatControls.appendChild(upBtn);
floatControls.appendChild(downBtn);
floatControls.appendChild(outlineToggleBtn);
floatControls.appendChild(formulaBtn);

const outlinePanel = document.createElement('div');
outlinePanel.id = 'gpt-outline-panel';
outlinePanel.className = 'hidden';

const outlineList = document.createElement('div');
outlineList.id = 'gpt-outline-list';
outlinePanel.appendChild(outlineList);

const outlineControls = document.createElement('div');
outlineControls.id = 'gpt-outline-controls';

const widthRow = document.createElement('div');
widthRow.className = 'gpt-outline-ctrl-row';
const widthLabel = document.createElement('span');
widthLabel.className = 'gpt-outline-ctrl-label';
widthLabel.textContent = '宽度:';
const outlineShrink = document.createElement('button');
outlineShrink.className = 'gpt-outline-resize-btn';
outlineShrink.title = '缩小大纲';
outlineShrink.textContent = '\u2212';
const outlineGrow = document.createElement('button');
outlineGrow.className = 'gpt-outline-resize-btn';
outlineGrow.title = '放大大纲';
outlineGrow.textContent = '+';
widthRow.appendChild(widthLabel);
widthRow.appendChild(outlineShrink);
widthRow.appendChild(outlineGrow);

const levelRow = document.createElement('div');
levelRow.className = 'gpt-outline-ctrl-row';
const levelLabel = document.createElement('span');
levelLabel.className = 'gpt-outline-ctrl-label';
levelLabel.textContent = '层级:';
const levelShrink = document.createElement('button');
levelShrink.className = 'gpt-outline-resize-btn';
levelShrink.title = '减少显示层级';
levelShrink.textContent = '\u2212';
const levelGrow = document.createElement('button');
levelGrow.className = 'gpt-outline-resize-btn';
levelGrow.title = '增加显示层级';
levelGrow.textContent = '+';
levelRow.appendChild(levelLabel);
levelRow.appendChild(levelShrink);
levelRow.appendChild(levelGrow);

outlineControls.appendChild(widthRow);
outlineControls.appendChild(levelRow);
outlinePanel.appendChild(outlineControls);

// ===== 公式复制设置面板 =====

const formulaPanel = document.createElement('div');
formulaPanel.id = 'gpt-formula-panel';
formulaPanel.className = 'hidden';

const formulaPanelTitle = document.createElement('div');
formulaPanelTitle.className = 'gpt-formula-panel-title';
formulaPanelTitle.textContent = 'Formula Copy';
formulaPanel.appendChild(formulaPanelTitle);

const formulaToggleRow = document.createElement('div');
formulaToggleRow.className = 'gpt-formula-row';

const formulaToggleLabel = document.createElement('span');
formulaToggleLabel.className = 'gpt-formula-label';
formulaToggleLabel.textContent = '启用公式复制';

const formulaToggle = document.createElement('label');
formulaToggle.className = 'gpt-formula-switch';

const formulaToggleInput = document.createElement('input');
formulaToggleInput.type = 'checkbox';
formulaToggleInput.id = 'gpt-formula-enabled';

const formulaToggleSlider = document.createElement('span');
formulaToggleSlider.className = 'gpt-formula-slider';

formulaToggle.appendChild(formulaToggleInput);
formulaToggle.appendChild(formulaToggleSlider);
formulaToggleRow.appendChild(formulaToggleLabel);
formulaToggleRow.appendChild(formulaToggle);
formulaPanel.appendChild(formulaToggleRow);

const formulaDivider = document.createElement('div');
formulaDivider.className = 'gpt-formula-divider';
formulaPanel.appendChild(formulaDivider);

const formulaFormatTitle = document.createElement('div');
formulaFormatTitle.className = 'gpt-formula-subtitle';
formulaFormatTitle.textContent = '复制格式';
formulaPanel.appendChild(formulaFormatTitle);

const formulaFormatGroup = document.createElement('div');
formulaFormatGroup.className = 'gpt-formula-format-group';

const _formulaFormatOptions = [
    { value: 'latex', label: 'LaTeX  ($…$)' },
    { value: 'raw', label: 'LaTeX  (raw)' },
    { value: 'mathml', label: 'MathML' },
];

_formulaFormatOptions.forEach(opt => {
    const row = document.createElement('label');
    row.className = 'gpt-formula-format-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'gpt-formula-format';
    radio.value = opt.value;
    const text = document.createElement('span');
    text.textContent = opt.label;
    row.appendChild(radio);
    row.appendChild(text);
    formulaFormatGroup.appendChild(row);
});

formulaPanel.appendChild(formulaFormatGroup);

const formulaHint = document.createElement('div');
formulaHint.className = 'gpt-formula-hint';
formulaHint.textContent = '启用后点击页面中的公式即可复制';
formulaPanel.appendChild(formulaHint);

document.body.appendChild(sidebar);
document.body.appendChild(floatControls);
document.body.appendChild(outlinePanel);
document.body.appendChild(formulaPanel);

let outlineVisible = true;
const OUTLINE_WIDTH_KEY = 'gpt-outline-width-pct';
const OUTLINE_WIDTH_MIN = 8;
const OUTLINE_WIDTH_MAX = 40;
let _outlineWidthPercent = parseInt(localStorage.getItem(OUTLINE_WIDTH_KEY)) || 20;

const OUTLINE_LEVEL_KEY = 'gpt-outline-max-level';
const OUTLINE_LEVEL_MIN = 0;
const OUTLINE_LEVEL_MAX = 5;
let _outlineMaxLevel = parseInt(localStorage.getItem(OUTLINE_LEVEL_KEY));
if (isNaN(_outlineMaxLevel)) _outlineMaxLevel = OUTLINE_LEVEL_MAX;
