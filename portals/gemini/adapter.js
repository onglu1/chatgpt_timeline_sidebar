/**
 * Gemini Portal Adapter for LLM Chat Navigator.
 *
 * Gemini DOM characteristics (Angular custom elements):
 * - Turn containers:     div.conversation-container (id=<turn_id>)
 * - User messages:       <user-query> inside conversation-container
 * - User text:           .query-text / .query-text-line
 * - Assistant responses: <model-response> → <message-content> → .markdown.markdown-main-panel
 * - Scroll container:    #chat-history (.chat-history-scroll-container)
 * - Content area:        chat-window / .chat-container
 * - Dark mode:           body.dark-theme (on <body class="theme-host dark-theme ...">)
 */

window.__LLM_NAV_ADAPTER = {
    name: 'gemini',

    getUserMessages() {
        return document.querySelectorAll('.conversation-container user-query');
    },

    getUserMessageText(el) {
        const lines = el.querySelectorAll('.query-text-line');
        if (lines.length > 0) {
            return Array.from(lines).map(l => l.textContent).join('\n').trim() || '空提示词';
        }
        const queryText = el.querySelector('.query-text');
        if (queryText) {
            const clone = queryText.cloneNode(true);
            clone.querySelectorAll('.cdk-visually-hidden').forEach(h => h.remove());
            return clone.textContent.trim() || '空提示词';
        }
        return el.textContent.trim() || '空提示词';
    },

    getTurnContainer(userMsgEl) {
        return userMsgEl.closest('.conversation-container') || userMsgEl;
    },

    getAssistantForUser(userMsgEl) {
        const turn = this.getTurnContainer(userMsgEl);
        if (!turn) return null;
        return turn.querySelector('model-response .markdown.markdown-main-panel')
            || turn.querySelector('model-response message-content')
            || turn.querySelector('model-response');
    },

    getMainElement() {
        return document.querySelector('main');
    },

    getObserveTarget() {
        return document.querySelector('#chat-history')
            || document.querySelector('[data-test-id="chat-history-container"]')
            || document.querySelector('infinite-scroller')
            || document.querySelector('.chat-container')
            || document.querySelector('main');
    },

    getBranchInfo(_turnContainer) {
        return null;
    },

    getHeadings(assistantEl) {
        return assistantEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
    },

    getContentRect() {
        const el = document.querySelector('.chat-container')
            || document.querySelector('chat-window')
            || document.querySelector('.content-container')
            || document.querySelector('bard-sidenav-content')
            || document.querySelector('main');
        return el ? el.getBoundingClientRect() : null;
    },
};
