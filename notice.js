(function () {
    fetch('/api/notice')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!data.text || !data.id) return;
            if (localStorage.getItem('dismissedNotice') === data.id) return;
            showNotice(data);
        })
        .catch(function () {});

    function showNotice(data) {
        var style = document.createElement('style');
        style.textContent = [
            '@keyframes noticeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}',
            '@keyframes noticePulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}'
        ].join('');
        document.head.appendChild(style);

        var overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '10001',
            background: 'rgba(0,0,0,0.92)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
            padding: '20px', boxSizing: 'border-box'
        });

        var box = document.createElement('div');
        Object.assign(box.style, {
            background: '#0d0505', border: '1px solid #7f1d1d',
            borderRadius: '16px', padding: '32px', maxWidth: '480px',
            width: '100%', display: 'flex', flexDirection: 'column', gap: '18px',
            animation: 'noticeIn 0.3s ease, noticePulse 2s ease 0.3s 2',
            boxShadow: '0 0 40px rgba(239,68,68,0.25), 0 24px 64px rgba(0,0,0,0.8)'
        });

        var badge = document.createElement('div');
        Object.assign(badge.style, {
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '20px', padding: '4px 14px', width: 'fit-content'
        });
        badge.innerHTML = '<span style="font-size:14px;">🚨</span>'
            + '<span style="font-size:12px;color:#ef4444;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Important Notice</span>';

        var textEl = document.createElement('div');
        Object.assign(textEl.style, {
            fontSize: '15px', color: '#f1f1f1', lineHeight: '1.65',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
        });
        textEl.textContent = data.text;

        var btn = document.createElement('button');
        btn.textContent = 'I Understand';
        Object.assign(btn.style, {
            padding: '12px 24px', borderRadius: '8px',
            border: '1px solid #ef4444', background: 'rgba(239,68,68,0.15)',
            color: '#ef4444', cursor: 'pointer', fontSize: '14px',
            fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em',
            transition: 'all 0.15s ease', outline: 'none', width: '100%'
        });
        btn.onmouseenter = function () {
            btn.style.background = '#ef4444';
            btn.style.color = '#fff';
        };
        btn.onmouseleave = function () {
            btn.style.background = 'rgba(239,68,68,0.15)';
            btn.style.color = '#ef4444';
        };

        function dismiss() {
            localStorage.setItem('dismissedNotice', data.id);
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.2s ease';
            setTimeout(function () { overlay.remove(); }, 200);
        }

        btn.onclick = dismiss;

        box.appendChild(badge);
        box.appendChild(textEl);
        box.appendChild(btn);
        overlay.appendChild(box);

        function show() { document.body.appendChild(overlay); }
        if (document.body) { show(); } else { document.addEventListener('DOMContentLoaded', show); }
    }

    // ── Admin key combo: Ctrl + Shift + N ──────────────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
            e.preventDefault();
            var pw = prompt('Enter admin password:');
            if (pw === null) return;
            openNoticeEditor(pw);
        }
    });

    function openNoticeEditor(pw) {
        var existing = document.getElementById('__noticeAdminOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = '__noticeAdminOverlay';
        Object.assign(overlay.style, {
            position: 'fixed', inset: '0', zIndex: '99998',
            background: 'rgba(0,0,0,0.9)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
            padding: '20px', boxSizing: 'border-box'
        });

        var box = document.createElement('div');
        Object.assign(box.style, {
            background: '#0d0505', border: '1px solid #7f1d1d', borderRadius: '14px',
            padding: '28px', width: '460px', maxWidth: '92vw',
            display: 'flex', flexDirection: 'column', gap: '14px'
        });

        var title = document.createElement('h3');
        title.textContent = '🚨 Edit Critical Notice';
        Object.assign(title.style, { margin: '0', fontSize: '17px', color: '#ef4444' });

        var hint = document.createElement('div');
        hint.style.cssText = 'font-size:12px;color:#666;';
        hint.textContent = 'Leave empty and save to clear the notice (removes it for everyone).';

        var status = document.createElement('div');
        status.style.cssText = 'font-size:13px;min-height:18px;';

        var ta = document.createElement('textarea');
        Object.assign(ta.style, {
            width: '100%', boxSizing: 'border-box', background: '#1a0a0a',
            border: '1px solid #7f1d1d', borderRadius: '8px', color: '#f1f1f1',
            fontSize: '14px', padding: '10px 14px', minHeight: '100px',
            resize: 'vertical', fontFamily: 'inherit', outline: 'none'
        });

        fetch('/api/notice').then(function (r) { return r.json(); }).then(function (d) {
            if (d.text) ta.value = d.text;
        }).catch(function () {});

        var btnRow = document.createElement('div');
        Object.assign(btnRow.style, { display: 'flex', gap: '10px', justifyContent: 'flex-end' });

        function mkBtn(label, bg, border, color) {
            var b = document.createElement('button');
            b.textContent = label;
            Object.assign(b.style, {
                margin: '0', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
                background: bg, border: '1px solid ' + border, color: color,
                fontSize: '14px', fontWeight: '600', outline: 'none'
            });
            return b;
        }

        var cancelBtn = mkBtn('Cancel', '#111', '#333', '#aaa');
        var saveBtn   = mkBtn('Save', '#200808', '#ef4444', '#ef4444');

        cancelBtn.onclick = function () { overlay.remove(); };
        saveBtn.onclick = async function () {
            saveBtn.textContent = 'Saving…';
            saveBtn.style.opacity = '0.6';
            try {
                var r = await fetch('/api/notice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: pw, text: ta.value.trim() })
                });
                var d = await r.json();
                if (!r.ok) {
                    status.style.color = '#f66';
                    status.textContent = d.error || 'Error saving.';
                } else {
                    if (d.text) {
                        localStorage.removeItem('dismissedNotice');
                    }
                    status.style.color = '#4ade80';
                    status.textContent = d.text ? 'Notice saved — users will see it on next page load.' : 'Notice cleared.';
                    setTimeout(function () { overlay.remove(); }, 1500);
                }
            } catch(err) {
                status.style.color = '#f66';
                status.textContent = 'Network error.';
            }
            saveBtn.textContent = 'Save';
            saveBtn.style.opacity = '1';
        };

        overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
        ta.addEventListener('keydown', function (e) { if (e.key === 'Escape') overlay.remove(); });

        btnRow.appendChild(cancelBtn);
        btnRow.appendChild(saveBtn);
        box.appendChild(title);
        box.appendChild(hint);
        box.appendChild(status);
        box.appendChild(ta);
        box.appendChild(btnRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        ta.focus();
    }
})();
