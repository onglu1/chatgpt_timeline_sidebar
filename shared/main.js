/**
 * Main initialization for LLM Chat Navigator.
 * Uses window.__LLM_NAV_ADAPTER (set by portal-specific adapter.js)
 * to interact with different AI portal DOM structures.
 */

(function () {
    const adapter = window.__LLM_NAV_ADAPTER;
    if (!adapter) {
        console.error('[LLM_Chat_Navigator] No adapter registered for this portal');
        return;
    }

    // === 公式复制初始化 ===

    formulaToggleInput.checked = getFormulaCopyEnabled();
    formulaBtn.classList.toggle('active', getFormulaCopyEnabled());

    const savedFormat = getFormulaCopyFormat();
    formulaPanel.querySelectorAll('input[name="gpt-formula-format"]').forEach(radio => {
        radio.checked = (radio.value === savedFormat);
    });

    initFormulaCopy();

    formulaBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = formulaPanel.classList.contains('hidden');
        if (isHidden) {
            outlineSettingsPanel.classList.add('hidden');
            const btnRect = formulaBtn.getBoundingClientRect();
            formulaPanel.style.top = `${btnRect.top - 40}px`;
            formulaPanel.style.right = `${window.innerWidth - btnRect.left + 12}px`;
            formulaPanel.classList.remove('hidden');
        } else {
            formulaPanel.classList.add('hidden');
        }
    });

    formulaToggleInput.addEventListener('change', () => {
        const enabled = formulaToggleInput.checked;
        setFormulaCopyEnabled(enabled);
        formulaBtn.classList.toggle('active', enabled);
    });

    formulaPanel.querySelectorAll('input[name="gpt-formula-format"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            setFormulaCopyFormat(e.target.value);
        });
    });

    // 点击面板外部时关闭面板
    document.addEventListener('click', (event) => {
        if (!formulaPanel.classList.contains('hidden')) {
            if (!formulaPanel.contains(event.target) && !formulaBtn.contains(event.target)) {
                formulaPanel.classList.add('hidden');
            }
        }
        if (!outlineSettingsPanel.classList.contains('hidden')) {
            if (!outlineSettingsPanel.contains(event.target) && !outlineToggleBtn.contains(event.target)) {
                outlineSettingsPanel.classList.add('hidden');
            }
        }
    });

    // === Event Listeners ===

    toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        sidebar.classList.toggle('collapsed');
        toggleBtn.classList.toggle('active', !sidebar.classList.contains('collapsed'));
        const start = performance.now();
        (function animatePositions() {
            updatePositions();
            if (performance.now() - start < 260) requestAnimationFrame(animatePositions);
        })();
    });

    // === 大纲设置面板初始化 ===

    outlineEnableInput.checked = outlineVisible;
    autoCollapseInput.checked = _outlineAutoCollapse;
    if (_outlineAutoCollapse) {
        outlinePanel.classList.add('auto-collapse');
    }

    outlineToggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = outlineSettingsPanel.classList.contains('hidden');
        if (isHidden) {
            formulaPanel.classList.add('hidden');
            const btnRect = outlineToggleBtn.getBoundingClientRect();
            outlineSettingsPanel.style.top = `${btnRect.top - 40}px`;
            outlineSettingsPanel.style.right = `${window.innerWidth - btnRect.left + 12}px`;
            outlineSettingsPanel.classList.remove('hidden');
        } else {
            outlineSettingsPanel.classList.add('hidden');
        }
    });

    outlineEnableInput.addEventListener('change', () => {
        outlineVisible = outlineEnableInput.checked;
        outlineToggleBtn.classList.toggle('active', outlineVisible);
        if (!outlineVisible) {
            outlinePanel.classList.add('hidden');
        } else {
            updateOutline();
        }
    });

    autoCollapseInput.addEventListener('change', () => {
        _outlineAutoCollapse = autoCollapseInput.checked;
        localStorage.setItem(OUTLINE_AUTO_COLLAPSE_KEY, String(_outlineAutoCollapse));
        outlinePanel.classList.toggle('auto-collapse', _outlineAutoCollapse);
    });

    outlineShrink.addEventListener('click', (e) => {
        e.stopPropagation();
        _outlineWidthPercent = Math.max(OUTLINE_WIDTH_MIN, _outlineWidthPercent - 1);
        localStorage.setItem(OUTLINE_WIDTH_KEY, String(_outlineWidthPercent));
        updatePositions();
    });

    outlineGrow.addEventListener('click', (e) => {
        e.stopPropagation();
        _outlineWidthPercent = Math.min(OUTLINE_WIDTH_MAX, _outlineWidthPercent + 1);
        localStorage.setItem(OUTLINE_WIDTH_KEY, String(_outlineWidthPercent));
        updatePositions();
    });

    levelShrink.addEventListener('click', (e) => {
        e.stopPropagation();
        _outlineMaxLevel = Math.max(OUTLINE_LEVEL_MIN, _outlineMaxLevel - 1);
        localStorage.setItem(OUTLINE_LEVEL_KEY, String(_outlineMaxLevel));
        updateOutline();
    });

    levelGrow.addEventListener('click', (e) => {
        e.stopPropagation();
        _outlineMaxLevel = Math.min(OUTLINE_LEVEL_MAX, _outlineMaxLevel + 1);
        localStorage.setItem(OUTLINE_LEVEL_KEY, String(_outlineMaxLevel));
        updateOutline();
    });

    // === Core Functions ===

    function getCurrentPromptIndex() {
        const messages = adapter.getUserMessages();
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
            const turn = adapter.getTurnContainer(messages[i]);
            if (turn.getBoundingClientRect().top <= viewTop + 80) {
                currentIndex = i;
            }
        }

        return currentIndex;
    }

    upBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const messages = adapter.getUserMessages();
        if (messages.length === 0) return;

        const currentIndex = getCurrentPromptIndex();
        const turn = adapter.getTurnContainer(messages[currentIndex]);

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
        const messages = adapter.getUserMessages();
        if (messages.length === 0) return;

        const currentIndex = getCurrentPromptIndex();
        const targetIndex = Math.min(messages.length - 1, currentIndex + 1);
        fastScrollTo(messages[targetIndex]);
    });

    function updatePositions() {
        const rect = adapter.getContentRect();
        if (!rect) return;

        outlinePanel.style.left = `${Math.max(8, rect.left + 16)}px`;
        outlineList.style.width = `${Math.max(120, Math.round(rect.width * _outlineWidthPercent / 100))}px`;

        const sidebarRight = Math.max(0, window.innerWidth - rect.right);
        sidebar.style.right = `${sidebarRight}px`;

        const sidebarWidth = sidebar.getBoundingClientRect().width;
        floatControls.style.right = sidebarWidth < 1
            ? `${sidebarRight + 16}px`
            : `${sidebarRight + sidebarWidth + 12}px`;
    }

    window.addEventListener('resize', updatePositions);

    function extractPrompts() {
        promptList.innerHTML = '';
        const messages = adapter.getUserMessages();

        messages.forEach((msg, index) => {
            const card = document.createElement('div');
            card.className = 'gpt-prompt-card';

            const headerDiv = document.createElement('div');
            headerDiv.className = 'gpt-prompt-header';
            headerDiv.innerText = index + 1;

            const textDiv = document.createElement('div');
            textDiv.className = 'gpt-prompt-text';
            textDiv.innerText = adapter.getUserMessageText(msg);

            card.appendChild(headerDiv);
            card.appendChild(textDiv);

            const turnContainer = adapter.getTurnContainer(msg);

            if (turnContainer) {
                const branchText = adapter.getBranchInfo(turnContainer);
                if (branchText) {
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
        const messages = adapter.getUserMessages();
        if (messages.length === 0) return null;
        const currentIndex = getCurrentPromptIndex();
        if (currentIndex < 0) return null;
        return adapter.getAssistantForUser(messages[currentIndex]);
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

        const headings = adapter.getHeadings(assistantMsg);
        if (headings.length === 0) {
            outlinePanel.classList.add('hidden');
            return;
        }

        // 收集所有实际出现的标题层级，排序去重后建立紧凑映射
        // 这样即使最高级标题不是 h1，或者中间有跳过的层级，都能正确显示
        const presentLevels = [...new Set(
            Array.from(headings).map(h => parseInt(h.tagName[1]))
        )].sort((a, b) => a - b);

        const levelMap = {};
        presentLevels.forEach((lvl, idx) => { levelMap[lvl] = idx; });

        outlinePanel.classList.remove('hidden');
        outlineList.innerHTML = '';

        headings.forEach(heading => {
            const level = parseInt(heading.tagName[1]);
            const rel = levelMap[level];
            if (rel > _outlineMaxLevel) return;

            const item = document.createElement('div');
            item.className = `gpt-outline-item gpt-outline-level-${rel}`;
            item.style.paddingLeft = `${rel * 14 + 10}px`;
            item.innerText = heading.textContent;
            item.title = heading.textContent;
            item.addEventListener('click', () => fastScrollTo(heading));
            outlineList.appendChild(item);
        });
    }

    // === Scroll-triggered Outline Update ===

    let _outlineTimer = null;
    let _outlineScrollEl = null;

    function _onOutlineScroll() {
        if (_outlineTimer) clearTimeout(_outlineTimer);
        _outlineTimer = setTimeout(updateOutline, 200);
    }

    function attachOutlineScroll() {
        const msgs = adapter.getUserMessages();
        if (msgs.length === 0) return;
        const el = getScrollContainer(msgs[0]);
        if (el === _outlineScrollEl) return;
        if (_outlineScrollEl) _outlineScrollEl.removeEventListener('scroll', _onOutlineScroll);
        _outlineScrollEl = el;
        _outlineScrollEl.addEventListener('scroll', _onOutlineScroll, { passive: true });
    }

    // === Reactive Refresh System (MutationObserver) ===

    let _mainObserver = null;
    let _resizeObserver = null;
    let _observedTarget = null;
    let _refreshTimer = null;
    let _lastMessageCount = 0;
    let _lastUrl = location.href;

    function scheduleRefresh(delay = 150) {
        clearTimeout(_refreshTimer);
        _refreshTimer = setTimeout(() => {
            const messages = adapter.getUserMessages();
            const count = messages.length;

            if (count !== _lastMessageCount) {
                _lastMessageCount = count;
                extractPrompts();
            }

            updateOutline();
            attachOutlineScroll();
            updatePositions();
        }, delay);
    }

    function connectObserver() {
        const target = adapter.getObserveTarget();
        if (!target) return false;
        if (target === _observedTarget && _mainObserver) return true;

        if (_mainObserver) _mainObserver.disconnect();
        if (_resizeObserver) _resizeObserver.disconnect();

        _mainObserver = new MutationObserver(() => scheduleRefresh());
        _mainObserver.observe(target, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        _resizeObserver = new ResizeObserver(() => updatePositions());
        _resizeObserver.observe(target);

        _observedTarget = target;
        return true;
    }

    function ensureConnection() {
        if (location.href !== _lastUrl) {
            _lastUrl = location.href;
            _lastMessageCount = 0;
            if (_mainObserver) _mainObserver.disconnect();
            if (_resizeObserver) _resizeObserver.disconnect();
            _observedTarget = null;
        }

        if (_observedTarget && !document.contains(_observedTarget)) {
            if (_mainObserver) _mainObserver.disconnect();
            if (_resizeObserver) _resizeObserver.disconnect();
            _observedTarget = null;
        }

        const target = adapter.getObserveTarget();
        if (!_observedTarget || _observedTarget !== target) {
            if (connectObserver()) {
                scheduleRefresh(0);
            }
        }
    }

    // === Bootstrap ===

    (function init() {
        if (connectObserver()) {
            scheduleRefresh(0);
        } else {
            setTimeout(init, 500);
        }
    })();

    setInterval(ensureConnection, 3000);
})();
