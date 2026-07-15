"use client";

import { useState, useEffect } from "react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import StatRow from "@/components/sys/dev/dsp";
import SpotifyPanel from "@/components/sys/signal/spotify";
import SignalTerminal from "@/components/sys/signal/SignalTerminal";

const CHANNELS = [
  { icon: "⌥", name: "GitHub", handle: "github.com/zaevotic", href: "https://github.com/zaevotic" },
  { icon: "in", name: "LinkedIn", handle: "linkedin.com/in/snehil-gautam-198347318/", href: "https://linkedin.com/in/snehil-gautam-198347318/" },
  { icon: "𝕏", name: "X", handle: "x.com/zaevo_licious", href: "https://x.com/zaevo_licious" },
  { icon: "#", name: "Discord", handle: "@thatdudeudontknow", href: "https://discord.com/users/1301959352415948852" },
  { icon: "@", name: "Email", handle: "zaevotic@proton.me", href: "mailto:zaevotic@proton.me" },
];

const AVAIL = [
  { k: "internships", v: "yes" },
  { k: "open source", v: "yes" },
  { k: "freelance", v: "selective" },
  { k: "full-time", v: "2027" },
];

export default function TemporaryPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [latestCommit, setLatestCommit] = useState("...");
  const [mailLogs, setMailLogs] = useState([
    { time: "14:02", status: "OK", color: "var(--green)", msg: "message received" },
    { time: "14:03", status: "INF", color: "var(--amber)", msg: "autoreply queued" },
    { time: "14:03", status: "OK", color: "var(--green)", msg: "sent [250 OK]" },
  ]);

  const handleTransmit = () => {
    if (!message) return;
    
    const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setMailLogs(prev => [
      ...prev,
      { time, status: "INF", color: "var(--amber)", msg: "opening mail client..." }
    ]);
    
    const subject = encodeURIComponent(`Message from ${name || "Guest"}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:zaevotic@proton.me?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      setMailLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), status: "OK", color: "var(--green)", msg: "mail client invoked" }
      ]);
    }, 1000);
  };

  useEffect(() => {
    fetch("/api/sys/github")
      .then((r) => r.json())
      .then((payload) => {
        if (!payload.error && payload.commits?.length > 0) {
          setLatestCommit(payload.commits[0].message);
        }
      })
      .catch(() => {});
  }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border2)",
    color: "var(--text)",
    padding: "10px 12px",
    fontFamily: "var(--mono)",
    fontSize: 12,
    outline: "none",
  };

  return (
    <div className="grid gap-[10px] h-auto xl:h-full grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1.5fr]">
      {/* Left Column: Send Message (Contact) */}
      <div className="flex flex-col h-full">
        <Panel delay={0.1} className="h-full flex flex-col">
          <PanelHead>
            <Dagger /> <b style={{ color: "var(--text)" }}>~/SEND_MESSAGE</b>
          </PanelHead>
          <PanelBody className="flex flex-col flex-1">
            {/* Name */}
            <div className="mb-[14px]">
              <label
                className="block text-[10px] tracking-[1px] uppercase mb-[7px]"
                style={{ color: "var(--red)" }}
              >
                <span style={{ color: "var(--text3)" }}>$ </span>enter --name
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
                style={{ color: "var(--red)" }}
              >
                <span style={{ color: "var(--text3)" }}>$ </span>enter --email
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
            <div className="mb-[14px] flex-1 flex flex-col">
              <label
                className="block text-[10px] tracking-[1px] uppercase mb-[7px]"
                style={{ color: "var(--red)" }}
              >
                <span style={{ color: "var(--text3)" }}>$ </span>nano --message
              </label>
              <textarea
                style={{ ...inputStyle, resize: "none", flex: 1 }}
                placeholder="write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {/* Submit */}
            <button
              onClick={handleTransmit}
              className="w-full px-[18px] py-[11px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors mt-auto"
              style={{
                background: "var(--red)",
                borderColor: "var(--red)",
                color: "var(--bg)",
              }}
            >
              + transmit message
            </button>
          </PanelBody>
        </Panel>
      </div>

      {/* Middle Column: Spotify, Now, Channels */}
      <div className="flex flex-col gap-[10px]">
        {/* STATUS PANEL */}
        <Panel delay={0.3}>
          <PanelHead>
            <Dagger /> <b style={{ color: "var(--text)" }}>NOW</b>
          </PanelHead>
          <PanelBody>
            <StatRow
              label={<span className="flex items-center">status</span>}
              value="online"
            />
            <StatRow label="location" value="Jodhpur" />
            <StatRow label="machine" value="OMEN-erde" />
            <StatRow label="commit" value={latestCommit} noBorder />
          </PanelBody>
        </Panel>

        {/* Availability panel */}
        <Panel delay={0.4}>
          <PanelHead>
            <Dagger /> <b style={{ color: "var(--text)" }}>AVAIL</b>
          </PanelHead>
          <PanelBody>
            {AVAIL.map((row, i) => (
              <StatRow
                key={row.k}
                label={row.k}
                value={row.v}
                noBorder={i === AVAIL.length - 1}
              />
            ))}
          </PanelBody>
        </Panel>

        {/* SPOTIFY PANEL */}
        <Panel delay={0.2}>
          <PanelHead>
            <Dagger /> <b style={{ color: "var(--text)" }}>SPOTIFY</b> .live
          </PanelHead>
          <PanelBody>
            <SpotifyPanel />
          </PanelBody>
        </Panel>
      </div>

      {/* Right Column: Avail, Mail Log, Memo */}
      <div className="flex flex-col gap-[10px] h-full md:col-span-2 xl:col-span-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] shrink-0">
          {/* CHANNELS PANEL */}
          <Panel delay={0.5}>
            <PanelHead>
              <Dagger /> <b style={{ color: "var(--text)" }}>CHANNELS</b>
            </PanelHead>
            <div className="flex flex-col">
              {CHANNELS.map((c, i) => {
                const Wrapper = c.href ? "a" : "div";
                return (
                <Wrapper
                  key={c.name}
                  {...(c.href ? { href: c.href, target: c.href.startsWith("mailto:") ? "_self" : "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-[12px] px-[14px] py-[12px] no-underline group transition-colors hover:bg-[rgba(182,24,43,0.03)]"
                  style={{
                    borderBottom:
                      i < CHANNELS.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                    cursor: c.href ? "pointer" : "default",
                  }}
                >
                  <div
                    className="flex items-center justify-center text-[13px] transition-colors group-hover:border-[var(--red-dim)] group-hover:text-[var(--red)]"
                    style={{
                      width: 30,
                      height: 30,
                      border: "1px solid var(--border2)",
                      color: "var(--red-ember)",
                      flexShrink: 0,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div
                      className="text-[11px] tracking-[0.5px] transition-colors group-hover:text-[var(--text)]"
                      style={{ color: "var(--text)" }}
                    >
                      {c.name}
                    </div>
                    <div
                      className="text-[10px] truncate max-w-[120px] block transition-colors group-hover:text-[var(--amber)]"
                      style={{ color: "var(--text2)" }}
                    >
                      {c.handle}
                    </div>
                  </div>
                </Wrapper>
                );
              })}
            </div>
          </Panel>

          {/* Mail Log */}
          <Panel delay={0.6} className="flex flex-col h-full">
            <PanelHead meta="tail">
              <Dagger /> <b style={{ color: "var(--text)" }}>MAIL.LOG</b>
            </PanelHead>
            <PanelBody className="flex flex-col gap-[4px]">
              {mailLogs.map((log, i) => (
                <div key={i} className="flex gap-[8px] text-[10px] leading-[1.7]">
                  <span style={{ color: "var(--text3)", flexShrink: 0 }}>
                    {log.time}
                  </span>
                  <span style={{ width: 20, flexShrink: 0, color: log.color }}>
                    {log.status}
                  </span>
                  <span style={{ color: "var(--text2)" }}>{log.msg}</span>
                </div>
              ))}
            </PanelBody>
          </Panel>
        </div>

        {/* SIGNAL TERMINAL PANEL */}
        <Panel
          delay={0.7}
          className="flex-1 overflow-hidden flex flex-col min-h-0"
        >
          <PanelHead>
            <Dagger /> <b style={{ color: "var(--text)" }}>SIGNAL</b> .--.
          </PanelHead>
          <PanelBody className="flex flex-col p-0" style={{ padding: 0 }}>
            <SignalTerminal />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
