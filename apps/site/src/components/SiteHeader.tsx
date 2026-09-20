import Link from "next/link";
import { navigationItems } from "../content/navigation";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" href="/">
          BlogGenius
        </Link>
        <nav aria-label="주 메뉴">
          <ul className="site-nav">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
