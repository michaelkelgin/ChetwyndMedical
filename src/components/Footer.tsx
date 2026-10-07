import Image from "next/image";
import Link from "next/link";
import { footerPublicLinks, site } from "@/lib/site";

export default function Footer() {
  const colA = footerPublicLinks.slice(0, 5);
  const colB = footerPublicLinks.slice(5);

  return (
    <footer className="site-footer">
      <div className="site-footer__atmosphere" aria-hidden="true" />
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__logo">
            <Image
              src="/assets/img/chetwynd-msa-logo.png"
              alt={site.name}
              width={1728}
              height={910}
              className="site-footer__logo-img"
            />
          </Link>
          <div className="site-footer__actions">
            <span className="site-footer__action">
              Contact Us · {site.placeholderEmail}
            </span>
          </div>
        </div>

        <div className="site-footer__cols">
          <h3>
            <span aria-hidden="true">◎</span> Public Pages
          </h3>
          <div className="site-footer__link-grid">
            <ul>
              {colA.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <ul>
              {colB.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site-footer__member">
          <h3>
            <span aria-hidden="true">◫</span> Member Pages
          </h3>
          <a href="#member-signin">Member Sign In</a>
          <p className="muted small">
            [PLACEHOLDER] Member portal / login not yet configured.
          </p>
        </div>

        <div className="site-footer__bottom">
          <hr />
          <div className="site-footer__bottom-grid">
            <div>
              <p className="copyright">© {site.name}</p>
              <p className="muted small">{site.domain}</p>
            </div>
            <p className="land-ack">{site.placeholderLandAcknowledgement}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
