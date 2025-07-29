import React, { useRef } from 'react';
import './Tabs.css';

export default function Tabs({ tabs, current, onChange, sticky }) {
  const rippleRefs = useRef({});

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

  return (
    <div className={sticky ? 'tabs-nav tabs-sticky' : 'tabs-nav'}>
      <div className="tabs-halo-bg"></div>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={
            'tab-btn' +
            (current === tab.key ? ' active tab-animated' : '') +
            (tab.badge ? ' tab-badge-parent' : '')
          }
          onClick={e => handleTabClick(e, tab.key)}
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

