import React from 'react';
import './Tabs.css';

export default function Tabs({ tabs, current, onChange, sticky }) {
  const handleTabClick = (e, key) => {
    // Ripple effect
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'tab-ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = (e.clientX - rect.left) + 'px';
    ripple.style.top = (e.clientY - rect.top) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
    onChange(key);
  };

  const handleKeyDown = (e, key) => {
    if (!tabs || !tabs.length) return;
    const idx = tabs.findIndex(t => t.key === current);
    if (e.key === 'ArrowRight') {
      const next = tabs[(idx + 1) % tabs.length];
      onChange(next.key);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      onChange(prev.key);
      e.preventDefault();
    }
  };

  return (
    <div className={sticky ? 'tabs-nav tabs-sticky' : 'tabs-nav'} role="tablist">
      <div className="tabs-halo-bg"></div>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={
            'tab-btn' +
            (current === tab.key ? ' active tab-animated' : '') +
            (tab.badge ? ' tab-badge-parent' : '')
          }
          role="tab"
          aria-selected={current === tab.key}
          tabIndex={current === tab.key ? 0 : -1}
          onClick={e => handleTabClick(e, tab.key)}
          onKeyDown={e => handleKeyDown(e, tab.key)}
        >
          {tab.icon && (
            <span className={
              'tab-icon' + (current === tab.key ? ' tab-icon-pulse' : '')
            }>{tab.icon}</span>
          )}
          {tab.label}
          {tab.badge && (
            <span className="tab-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
