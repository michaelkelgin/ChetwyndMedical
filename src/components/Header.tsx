"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav, site } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo" aria-label={`${site.name} home`}>
          <Image
            src="/assets/img/chetwynd-msa-logo.png"
            alt={site.name}
            width={1728}
            height={910}
            className="site-logo__img"
            priority
          />
        </Link>

        <a className="member-tab" href="#member-signin">
          Member Sign In
        </a>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-btn__bars" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="menu-btn__label">Menu</span>
        </button>

        <nav
          id="site-nav"
          className={`site-nav ${open ? "is-open" : ""}`}
          aria-label="Primary"
        >
          <ul className="site-nav__list">
            {mainNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const hasChildren = Boolean(item.children?.length);
              const dropdownOpen = openDropdown === item.label;

              return (
                <li
                  key={item.href}
                  className={`site-nav__item ${hasChildren ? "has-children" : ""} ${active ? "is-active" : ""}`}
                >
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        className="site-nav__link site-nav__parent"
                        aria-expanded={dropdownOpen}
                        onClick={() =>
                          setOpenDropdown(dropdownOpen ? null : item.label)
                        }
                      >
                        {item.label}
                        <span className="site-nav__caret" aria-hidden="true">
                          ▾
                        </span>
                      </button>
                      <ul
                        className={`site-nav__dropdown ${dropdownOpen ? "is-open" : ""}`}
                      >
                        <li>
                          <Link href={item.href} className="site-nav__drop-link">
                            Overview
                          </Link>
                        </li>
                        {item.children!.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="site-nav__drop-link"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link href={item.href} className="site-nav__link">
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      {open ? (
        <button
          type="button"
          className="nav-overlay"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </header>
  );
}
