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

floatControls.appendChild(toggleBtn);
floatControls.appendChild(upBtn);
floatControls.appendChild(downBtn);
floatControls.appendChild(outlineToggleBtn);

const outlinePanel = document.createElement('div');
outlinePanel.id = 'gpt-outline-panel';
outlinePanel.className = 'hidden';

const outlineList = document.createElement('div');
outlineList.id = 'gpt-outline-list';
outlinePanel.appendChild(outlineList);

const outlineEye = document.createElement('div');
outlineEye.id = 'gpt-outline-eye';
outlineEye.title = '折叠/展开大纲';
outlineEye.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
outlinePanel.appendChild(outlineEye);

document.body.appendChild(sidebar);
document.body.appendChild(floatControls);
document.body.appendChild(outlinePanel);

let outlineVisible = true;
let outlineCollapsed = false;

toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    sidebar.classList.toggle('collapsed');
    toggleBtn.classList.toggle('active', !sidebar.classList.contains('collapsed'));
    updatePositions();
});

outlineToggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    outlineVisible = !outlineVisible;
    outlineToggleBtn.classList.toggle('active', outlineVisible);
    if (!outlineVisible) {
        outlinePanel.classList.add('hidden');
    } else {
        updateOutline();
    }
});

outlineEye.addEventListener('click', () => {
    outlineCollapsed = !outlineCollapsed;
    outlinePanel.classList.toggle('outline-collapsed', outlineCollapsed);
    if (outlineCollapsed) {
        outlineEye.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    } else {
        outlineEye.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
});

function getScrollContainer(element) {
    let current = element;
    while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            return current;
        }
        current = current.parentElement;
    }
    return window;
}

function fastScrollTo(targetElement) {
    const container = getScrollContainer(targetElement);
    const duration = 100;

    let startPosition, targetPosition;

    if (container === window) {
        startPosition = window.scrollY;
        targetPosition = targetElement.getBoundingClientRect().top + startPosition;
    } else {
        startPosition = container.scrollTop;
        const containerTop = container.getBoundingClientRect().top;
        const targetTop = targetElement.getBoundingClientRect().top;
        targetPosition = startPosition + (targetTop - containerTop) - 50;
    }

    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const currentScroll = startPosition + distance * progress;

        if (container === window) {
            window.scrollTo(0, currentScroll);
        } else {
            container.scrollTop = currentScroll;
        }

        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}

function getCurrentPromptIndex() {
    const messages = document.querySelectorAll('[data-message-author-role="user"]');
    if (messages.length === 0) return -1;

    const scrollContainer = getScrollContainer(messages[0]);
    let viewTop;
    if (scrollContainer === window) {
        viewTop = 0;
    } else {
        viewTop = scrollContainer.getBoundingClientRect().top;
    }

    let currentIndex = 0;
    for (let i = 0; i < messages.length; i++) {
        const turn = messages[i].closest('[data-testid^="conversation-turn"]')
            || messages[i].closest('article')
            || messages[i];
        if (turn.getBoundingClientRect().top <= viewTop + 80) {
            currentIndex = i;
        }
    }

    return currentIndex;
}

upBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const messages = document.querySelectorAll('[data-message-author-role="user"]');
    if (messages.length === 0) return;

    const currentIndex = getCurrentPromptIndex();
    const turn = messages[currentIndex].closest('[data-testid^="conversation-turn"]')
        || messages[currentIndex].closest('article')
        || messages[currentIndex];

    const scrollContainer = getScrollContainer(messages[0]);
    const viewTop = scrollContainer === window
        ? 0
        : scrollContainer.getBoundingClientRect().top;
    const turnTop = turn.getBoundingClientRect().top;

    if (turnTop > viewTop - 100) {
        fastScrollTo(messages[Math.max(0, currentIndex - 1)]);
    } else {
        fastScrollTo(messages[currentIndex]);
    }
});

downBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const messages = document.querySelectorAll('[data-message-author-role="user"]');
    if (messages.length === 0) return;

    const currentIndex = getCurrentPromptIndex();
    const targetIndex = Math.min(messages.length - 1, currentIndex + 1);
    fastScrollTo(messages[targetIndex]);
});

function updatePositions() {
    const main = document.querySelector('main#main') || document.querySelector('main');
    if (!main) return;
    const rect = main.getBoundingClientRect();

    outlinePanel.style.left = `${Math.max(8, rect.left + 16)}px`;

    const sidebarRight = Math.max(0, window.innerWidth - rect.right);
    sidebar.style.right = `${sidebarRight}px`;

    if (sidebar.classList.contains('collapsed')) {
        floatControls.style.right = `${sidebarRight + 16}px`;
    } else {
        floatControls.style.right = `${sidebarRight + 320 + 12}px`;
    }
}

window.addEventListener('resize', updatePositions);

function extractPrompts() {
    promptList.innerHTML = '';
    const messages = document.querySelectorAll('[data-message-author-role="user"]');

    messages.forEach((msg, index) => {
        const card = document.createElement('div');
        card.className = 'gpt-prompt-card';

        const headerDiv = document.createElement('div');
        headerDiv.className = 'gpt-prompt-header';
        headerDiv.innerText = index + 1;

        const textDiv = document.createElement('div');
        textDiv.className = 'gpt-prompt-text';
        textDiv.innerText = msg.textContent || '空提示词';

        card.appendChild(headerDiv);
        card.appendChild(textDiv);

        const turnContainer = msg.closest('[data-testid^="conversation-turn"]') || msg.closest('article');

        if (turnContainer) {
            const branchDiv = turnContainer.querySelector('.tabular-nums');
            if (branchDiv && branchDiv.textContent.includes('/')) {
                const branchText = branchDiv.textContent.trim();

                const footerDiv = document.createElement('div');
                footerDiv.className = 'gpt-prompt-footer';

                const branchSpan = document.createElement('span');
                branchSpan.className = 'gpt-prompt-branch';
                branchSpan.innerText = `< ${branchText} >`;

                footerDiv.appendChild(branchSpan);
                card.appendChild(footerDiv);
            }
        }

        card.addEventListener('click', (event) => {
            event.stopPropagation();
            fastScrollTo(msg);
        });

        promptList.appendChild(card);
    });
}

function getCurrentAssistantResponse() {
    const messages = document.querySelectorAll('[data-message-author-role="user"]');
    if (messages.length === 0) return null;
    const currentIndex = getCurrentPromptIndex();
    if (currentIndex < 0) return null;

    const userMsg = messages[currentIndex];
    const userTurn = userMsg.closest('[data-testid^="conversation-turn"]')
        || userMsg.closest('article')
        || userMsg;

    let sibling = userTurn.nextElementSibling;
    while (sibling) {
        const assistant = sibling.querySelector('[data-message-author-role="assistant"]');
        if (assistant) return assistant;
        if (sibling.querySelector('[data-message-author-role="user"]')) break;
        sibling = sibling.nextElementSibling;
    }
    return null;
}

function updateOutline() {
    if (!outlineVisible) {
        outlinePanel.classList.add('hidden');
        return;
    }

    const assistantMsg = getCurrentAssistantResponse();
    if (!assistantMsg) {
        outlinePanel.classList.add('hidden');
        return;
    }

    const headings = assistantMsg.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
        outlinePanel.classList.add('hidden');
        return;
    }

    let minLevel = 6;
    headings.forEach(h => {
        const lvl = parseInt(h.tagName[1]);
        if (lvl < minLevel) minLevel = lvl;
    });

    outlinePanel.classList.remove('hidden');
    outlineList.innerHTML = '';

    headings.forEach(heading => {
        const level = parseInt(heading.tagName[1]);
        const rel = level - minLevel;

        const item = document.createElement('div');
        item.className = `gpt-outline-item gpt-outline-level-${rel}`;
        item.style.paddingLeft = `${rel * 14 + 10}px`;
        item.innerText = heading.textContent;
        item.title = heading.textContent;
        item.addEventListener('click', () => fastScrollTo(heading));
        outlineList.appendChild(item);
    });
}

let _outlineTimer = null;
let _outlineScrollEl = null;

function _onOutlineScroll() {
    if (_outlineTimer) clearTimeout(_outlineTimer);
    _outlineTimer = setTimeout(updateOutline, 200);
}

function attachOutlineScroll() {
    const msgs = document.querySelectorAll('[data-message-author-role="user"]');
    if (msgs.length === 0) return;
    const el = getScrollContainer(msgs[0]);
    if (el === _outlineScrollEl) return;
    if (_outlineScrollEl) _outlineScrollEl.removeEventListener('scroll', _onOutlineScroll);
    _outlineScrollEl = el;
    _outlineScrollEl.addEventListener('scroll', _onOutlineScroll, { passive: true });
}

function refreshAll() {
    extractPrompts();
    updateOutline();
    attachOutlineScroll();
    updatePositions();
}

setInterval(refreshAll, 2000);
setTimeout(refreshAll, 1000);
