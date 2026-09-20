import Link from "next/link";

const channels = [
  {
    label: "카카오 오픈채팅방",
    href: "https://open.kakao.com/o/gZWL25Zh",
    glyph: "talk",
  },
  {
    label: "네이버 블로그 도전인생",
    href: "https://blog.naver.com/amadejjs",
    glyph: "blog",
  },
  {
    label: "인스타그램 amadejjs",
    href: "https://instagram.com/amadejjs",
    glyph: "instagram",
  },
  {
    label: "Threads amadejjs",
    href: "https://www.threads.com/@amadejjs",
    glyph: "threads",
  },
  {
    label: "이메일 문의 amadejjs@naver.com",
    href: "mailto:amadejjs@naver.com",
    glyph: "mail",
  },
] as const;

function Glyph({ kind }: { kind: (typeof channels)[number]["glyph"] }) {
  if (kind === "blog") {
    return (
      <span aria-hidden="true" className="glyph-text">
        N
      </span>
    );
  }
  if (kind === "threads") {
    return (
      <span aria-hidden="true" className="glyph-text">
        @
      </span>
    );
  }
  return (
    <svg aria-hidden="true" className="glyph-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {kind === "talk" ? (
        <path d="M12 3.5c5 0 9 3.1 9 7 0 2.4-1.5 4.5-3.8 5.7-.4.2-.6.6-.5 1l.5 2.1c.1.4-.2.8-.6.7l-2.5-1.2c-.3-.1-.6-.1-.9 0C11.4 19.3 9.3 20 7 20c-.8 0-1.6-.1-2.3-.2C2.9 19.2 3 10.5 3 10.5c0-3.9 4-7 9-7Z" />
      ) : null}
      {kind === "instagram" ? (
        <>
          <rect x="4" y="4" width="16" height="16" rx="4.5" />
          <circle cx="12" cy="12" r="3.6" />
          <circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {kind === "mail" ? (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="m4.5 7.5 7.5 5.5 7.5-5.5" />
        </>
      ) : null}
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-meta">
          <p className="footer-brand">BlogGenius</p>
          <p className="footer-legal">© 도전인생 All rights reserved</p>
        </div>
        <ul className="footer-channels" aria-label="BlogGenius 채널">
          {channels.map((channel) => (
            <li key={channel.href}>
              <a
                className="channel-button"
                href={channel.href}
                aria-label={channel.label}
                rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
                target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
              >
                <Glyph kind={channel.glyph} />
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="site-footer-inner footer-support">
        <p className="footer-note">
          빠른 도움은 <Link href="/support/">지원 안내</Link>를 이용하세요.
        </p>
      </div>
    </footer>
  );
}
