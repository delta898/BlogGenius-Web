export interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

export const navigationItems: readonly NavigationItem[] = [
  { href: "/", label: "소개" },
  { href: "/features/", label: "기능" },
  { href: "/download/", label: "다운로드" },
  { href: "/guides/", label: "가이드" },
  { href: "/changelog/", label: "변경내역" },
  { href: "/support/", label: "지원" },
];

export const supportChatUrl = "https://open.kakao.com/o/gZWL25Zh";
