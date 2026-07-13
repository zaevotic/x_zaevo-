'use client';

import { useState } from 'react';
import Panel, { PanelHead, PanelBody, Dagger } from '@/components/ui/Panel';

// ── Data ──────────────────────────────────────────────────────────────────────

const CHANNELS = [
  { icon: '⌥', name: 'GitHub',   handle: 'github.com/serpmillers' },
  { icon: 'in', name: 'LinkedIn', handle: 'linkedin.com/in/serpmillers' },
  { icon: '@',  name: 'Email',    handle: 'serpmillers@proton.me' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
    padding: '10px 12px',
    fontFamily: 'var(--mono)',
    fontSize: 12,
    outline: 'none',
  };

  return (
    <div
      className="grid gap-[14px]"
      style={{ gridTemplateColumns: '1.3fr 1fr' }}
    >
      {/* Contact form */}
      <Panel delay={0.1}>
        <PanelHead>
          <Dagger /> <b style={{ color: 'var(--text)' }}>~/SEND_MESSAGE</b>
        </PanelHead>
        <PanelBody>
          {/* Name */}
          <div className="mb-[14px]">
            <label
              className="block text-[10px] tracking-[1px] uppercase mb-[7px]"
              style={{ color: 'var(--red)' }}
            >
              <span style={{ color: 'var(--text3)' }}>$ </span>enter --name
            </label>
            <input
              style={inputStyle}
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Email */}
          <div className="mb-[14px]">
            <label
              className="block text-[10px] tracking-[1px] uppercase mb-[7px]"
              style={{ color: 'var(--red)' }}
            >
              <span style={{ color: 'var(--text3)' }}>$ </span>enter --email
            </label>
            <input
              type="email"
              style={inputStyle}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Message */}
          <div className="mb-[14px]">
            <label
              className="block text-[10px] tracking-[1px] uppercase mb-[7px]"
              style={{ color: 'var(--red)' }}
            >
              <span style={{ color: 'var(--text3)' }}>$ </span>nano --message
            </label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
              placeholder="write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          {/* Submit */}
          <button
            className="w-full px-[18px] py-[11px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors"
            style={{
              background: 'var(--red)',
              borderColor: 'var(--red)',
              color: '#150606',
            }}
          >
            ⚡ transmit message
          </button>
        </PanelBody>
      </Panel>

      {/* Right column */}
      <div className="flex flex-col gap-[14px]">
        {/* Status */}
        <Panel delay={0.2}>
          <PanelHead>
            <Dagger /> <b style={{ color: 'var(--text)' }}>STATUS</b>
          </PanelHead>
          <PanelBody>
            {/* Availability indicator */}
            <div
              className="flex items-center gap-[10px] px-[14px] py-[12px] border mb-[14px]"
              style={{
                background: 'linear-gradient(90deg, rgba(182,24,43,0.14), transparent)',
                borderColor: 'var(--border2)',
              }}
            >
              <span
                className="text-[12px] tracking-[1px] uppercase"
                style={{ color: 'var(--text)' }}
              >
                open to opportunities
              </span>
            </div>
            <p
              className="text-[11px] leading-[1.8]"
              style={{ color: 'var(--text2)' }}
            >
              Based in India · Remote-first · IST (UTC+5:30)
              <br />
              Usually responds within a day.
            </p>
          </PanelBody>
        </Panel>

        {/* Channels */}
        <Panel delay={0.3}>
          <PanelHead>
            <Dagger /> <b style={{ color: 'var(--text)' }}>CHANNELS</b>
          </PanelHead>
          <div>
            {CHANNELS.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-[12px] px-[14px] py-[12px]"
                style={{
                  borderBottom:
                    i < CHANNELS.length - 1
                      ? '1px solid var(--border)'
                      : 'none',
                }}
              >
                <div
                  className="flex items-center justify-center text-[13px]"
                  style={{
                    width: 30,
                    height: 30,
                    border: '1px solid var(--border2)',
                    color: 'var(--red-ember)',
                    flexShrink: 0,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.5px]" style={{ color: 'var(--text)' }}>
                    {c.name}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text2)' }}>
                    {c.handle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
