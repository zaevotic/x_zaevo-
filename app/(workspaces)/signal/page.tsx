"use client";

import { useState, useEffect, useRef } from "react";
import Panel, { PanelHead, PanelBody, Dagger } from "@/components/ui/Panel";
import StatRow from "@/components/sys/dev/dsp";
import SpotifyPanel from "@/components/sys/signal/spotify";
import SignalTerminal from "@/components/sys/signal/SignalTerminal";
import MailLogPanel, { type MailLogHandle } from "@/components/sys/signal/MailLogPanel";

const CHANNELS = [
  {
    icon: "⌥",
    name: "GitHub",
    handle: "github.com/zaevotic",
    href: "https://github.com/zaevotic",
  },
  {
    icon: "in",
    name: "LinkedIn",
    handle: "linkedin.com/in/snehil-gautam-198347318/",
    href: "https://linkedin.com/in/snehil-gautam-198347318/",
  },
  {
    icon: "𝕏",
    name: "X",
    handle: "x.com/zaevo_licious",
    href: "https://x.com/zaevo_licious",
  },
  {
    icon: "#",
    name: "Discord",
    handle: "@thatdudeudontknow",
    href: "https://discord.com/users/1301959352415948852",
  },
  {
    icon: "@",
    name: "Email",
    handle: "zaevotic@proton.me",
    href: "mailto:zaevotic@proton.me",
  },
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
  
  const mailLogRef = useRef<MailLogHandle>(null);
  const hasConnectedRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputFocus = () => {
    if (!hasConnectedRef.current) {
      hasConnectedRef.current = true;
      mailLogRef.current?.log("SYS", "smtpd: client connection accepted [127.0.0.1:587]", {
        proto: "ESMTP",
        tls: "TLSv1.3",
        cipher: "TLS_AES_256_GCM_SHA384",
      });
    }
  };

  const handleNameBlur = () => {
    if (name.trim()) {
      mailLogRef.current?.log("INF", `smtpd: sender identity set: "${name.trim()}"`, {
        sender: name.trim(),
        auth: "anonymous-token",
      });
    }
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (isValid) {
        mailLogRef.current?.log("OK", `smtpd: envelope-from valid: <${email.trim()}>`, {
          envelope: email.trim(),
          dkim: "queued",
        });
      } else {
        mailLogRef.current?.log("WRN", `smtpd: envelope syntax unverified: <${email.trim()}>`);
      }
    }
  };

  const handleMessageChange = (val: string) => {
    setMessage(val);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    if (val.trim()) {
      typingTimerRef.current = setTimeout(() => {
        mailLogRef.current?.log("INF", `smtpd: payload buffer staged [${val.length} bytes]`);
      }, 800);
    }
  };

  const handleTransmit = () => {
    if (!message.trim()) {
      mailLogRef.current?.log("WRN", "smtpd: transmission aborted [empty payload body]");
      return;
    }

    mailLogRef.current?.log("INF", "smtpd: staging transmission envelope...", {
      sender: name.trim() || "anonymous",
      envelopeFrom: email.trim() || "guest@terminal",
      recipient: "zaevotic@proton.me",
      size: `${message.length} bytes`,
    });

    setTimeout(() => {
      mailLogRef.current?.log("OK", "dkim: transmission signed [rsa-2048/sha256]");
    }, 280);

    setTimeout(() => {
      mailLogRef.current?.log(
        "OK",
        "client handover: invoked mailto:zaevotic@proton.me [250 OK]",
        {
          id: Math.random().toString(36).slice(2, 8),
          status: "250 2.0.0 Ok: queued",
        }
      );
    }, 650);

    setTimeout(() => {
      mailLogRef.current?.log("SYS", "smtpd: socket closed, daemon returned to idle");
    }, 1500);

    const subject = encodeURIComponent(`Message from ${name || "Guest"}`);
    const body = encodeURIComponent(message);
    const mailtoUrl = `mailto:zaevotic@proton.me?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, "_blank", "noopener,noreferrer");
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
    <div className="grid gap-[10px] grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,1.15fr)] h-auto landscape:min-h-full xl:min-h-full">
      {/* ── COLUMN 1: TRANSMIT (SEND_MESSAGE) ─────────── */}
      <div className="flex flex-col h-full min-w-0">
        <Panel
          delay={0.1}
          className="h-full min-h-[360px] flex flex-col"
        >
          <PanelHead meta="contact.sh">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              SEND_MESSAGE
            </b>
          </PanelHead>
          <PanelBody className="flex-1 min-h-0 flex flex-col gap-[14px] p-[16px]">
            <p
              className="text-[11px] leading-[1.6] shrink-0 mb-[2px]"
              style={{ color: "var(--text3)", fontFamily: "var(--sans)" }}
            >
              {"// "}Opens a pre-filled draft in your mail client. Direct transmission, zero telemetry.
            </p>

            {/* Name */}
            <div className="shrink-0">
              <label
                className="block text-[10px] tracking-[1px] uppercase mb-[6px]"
                style={{ color: "var(--red)" }}
              >
                <span style={{ color: "var(--text3)" }}>$ </span>enter --name
              </label>
              <input
                style={inputStyle}
                placeholder="your name"
                value={name}
                onFocus={handleInputFocus}
                onBlur={handleNameBlur}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="shrink-0">
              <label
                className="block text-[10px] tracking-[1px] uppercase mb-[6px]"
                style={{ color: "var(--red)" }}
              >
                <span style={{ color: "var(--text3)" }}>$ </span>enter --email
              </label>
              <input
                type="email"
                style={inputStyle}
                placeholder="your@email.com"
                value={email}
                onFocus={handleInputFocus}
                onBlur={handleEmailBlur}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Message */}
            <div className="flex-1 min-h-[120px] flex flex-col">
              <label
                className="block text-[10px] tracking-[1px] uppercase mb-[6px] shrink-0"
                style={{ color: "var(--red)" }}
              >
                <span style={{ color: "var(--text3)" }}>$ </span>nano --message
              </label>
              <textarea
                style={{ ...inputStyle, resize: "none" }}
                className="flex-1 min-h-[100px] w-full"
                placeholder="write your transmission here..."
                value={message}
                onFocus={handleInputFocus}
                onChange={(e) => handleMessageChange(e.target.value)}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleTransmit}
              type="button"
              className="w-full px-[18px] py-[12px] text-[11px] tracking-[1px] uppercase font-bold border cursor-pointer transition-colors hover:opacity-90 active:scale-[0.99] shrink-0 mt-auto"
              style={{
                background: "var(--red)",
                borderColor: "var(--red)",
                color: "var(--bg)",
                fontFamily: "var(--mono)",
              }}
            >
              + transmit message →
            </button>
          </PanelBody>
        </Panel>
      </div>

      {/* ── COLUMN 2: TELEMETRY (STATUS, AVAIL, SPOTIFY) ─────────── */}
      <div className="flex flex-col gap-[10px] min-w-0">
        {/* STATUS PANEL */}
        <Panel delay={0.2}>
          <PanelHead meta="online · now.rc">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              STATUS
            </b>
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
        <Panel delay={0.25}>
          <PanelHead meta="schedule.cfg">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              AVAIL
            </b>
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
        <SpotifyPanel delay={0.3} />
      </div>

      {/* ── COLUMN 3: CONNECTIONS (CHANNELS, MAIL LOG & SIGNAL) ───── */}
      <div className="flex flex-col gap-[10px] md:col-span-2 xl:col-span-1 min-w-0">
        {/* Top row in Column 3: Channels on the left, Mail log on the right */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] min-w-0 sm:h-[280px]">
          {/* CHANNELS PANEL */}
          <Panel delay={0.35} className="flex flex-col h-full overflow-hidden">
            <PanelHead meta="channels.lst">
              <Dagger /> ~/{" "}
              <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
                CHANNELS
              </b>
            </PanelHead>
            <div className="flex flex-col flex-1 min-h-0">
              {CHANNELS.map((c, i) => {
                const Wrapper = c.href ? "a" : "div";
                return (
                  <Wrapper
                    key={c.name}
                    {...(c.href
                      ? {
                          href: c.href,
                          target: c.href.startsWith("mailto:")
                            ? "_self"
                            : "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {})}
                    className="flex-1 flex items-center justify-between px-[12px] py-[4px] no-underline group transition-colors hover:bg-[var(--red-hover-tint)] min-h-0"
                    style={{
                      borderBottom:
                        i < CHANNELS.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      cursor: c.href ? "pointer" : "default",
                    }}
                  >
                    <div className="flex items-center gap-[10px] min-w-0 flex-1 mr-[6px]">
                      <div
                        className="flex items-center justify-center text-[12px] transition-colors group-hover:border-[var(--red-dim)] group-hover:text-[var(--red)]"
                        style={{
                          width: 26,
                          height: 26,
                          border: "1px solid var(--border2)",
                          color: "var(--red-ember)",
                          flexShrink: 0,
                        }}
                      >
                        {c.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-[11px] font-medium tracking-[0.5px] transition-colors group-hover:text-[var(--text)] truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {c.name}
                        </div>
                        <div
                          className="text-[10px] truncate transition-colors group-hover:text-[var(--amber)]"
                          style={{ color: "var(--text3)" }}
                        >
                          {c.handle}
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-[11px] transition-transform group-hover:translate-x-[2px] group-hover:text-[var(--red)]"
                      style={{ color: "var(--text3)" }}
                    >
                      ↗
                    </span>
                  </Wrapper>
                );
              })}
            </div>
          </Panel>

          {/* MAIL LOG PANEL (to the right of Channels) */}
          <MailLogPanel ref={mailLogRef} delay={0.4} />
        </div>

        {/* Bottom in Column 3: Signal Terminal */}
        <Panel delay={0.45} className="flex flex-col">
          <PanelHead meta=".--. · morse.raw">
            <Dagger /> ~/{" "}
            <b style={{ color: "var(--text)", letterSpacing: "1px" }}>
              SIGNAL
            </b>
          </PanelHead>
          <PanelBody className="flex flex-col p-0" style={{ padding: 0 }}>
            <SignalTerminal />
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
