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

// 悬浮按钮组容器（无背景，竖排）
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

floatControls.appendChild(toggleBtn);
floatControls.appendChild(upBtn);
floatControls.appendChild(downBtn);

document.body.appendChild(sidebar);
document.body.appendChild(floatControls);

// 展开/折叠侧边栏
toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isCollapsed = sidebar.classList.toggle('collapsed');
    document.body.classList.toggle('gpt-sidebar-open', !isCollapsed);
    toggleBtn.classList.toggle('active', !isCollapsed);
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

// 判断当前正在阅读的 prompt 索引
// 方法：页面顶部所处的区块即为正在阅读的区块。
// 找最后一个 turn 顶部已滚过视口顶部的 prompt。
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

// 向上：如果当前在某个 prompt 内容中间，先回到该 prompt 顶部；
// 如果已经在顶部附近，才跳到上一个 prompt（类似音乐播放器"上一曲"逻辑）。
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

    // 当前 prompt 顶部距视口顶部 < 100px，说明已经在这个 prompt 的开头附近，跳到上一个
    // 否则说明还在这个 prompt 的内容中间，先回到这个 prompt 顶部
    if (turnTop > viewTop - 100) {
        fastScrollTo(messages[Math.max(0, currentIndex - 1)]);
    } else {
        fastScrollTo(messages[currentIndex]);
    }
});

// 向下：始终跳到下一个 Prompt
downBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const messages = document.querySelectorAll('[data-message-author-role="user"]');
    if (messages.length === 0) return;

    const currentIndex = getCurrentPromptIndex();
    const targetIndex = Math.min(messages.length - 1, currentIndex + 1);
    fastScrollTo(messages[targetIndex]);
});

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

setInterval(extractPrompts, 2000);
setTimeout(extractPrompts, 1000);
