import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-column">
            <h4>Quick Links</h4>
            <div className="site-footer-links">
              <Link href="/"><i className="fas fa-chevron-right" /> Home</Link>
              <Link href="/contact-us"><i className="fas fa-chevron-right" /> Contact Us</Link>
              <Link href="/categories"><i className="fas fa-chevron-right" /> All Categories</Link>
              <Link href="/sub-categories"><i className="fas fa-chevron-right" /> All Sub Categories</Link>
            </div>
          </div>

          <div className="site-footer-column">
            <h4>About & Policies</h4>
            <div className="site-footer-links">
              <Link href="/about"><i className="fas fa-chevron-right" /> About Us</Link>
              <Link href="/about/terms"><i className="fas fa-chevron-right" /> Terms & Conditions</Link>
              <Link href="/about/privacy"><i className="fas fa-chevron-right" /> Privacy Policy</Link>
              <Link href="/about/refund"><i className="fas fa-chevron-right" /> Refund Policy</Link>
            </div>
          </div>

          <div className="site-footer-column">
            <h4>Follow us on</h4>
            <div className="site-footer-social">
              <Link href="https://www.facebook.com/share/1B77PC4cX4/" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f" /></Link>
              <Link href="https://www.instagram.com/bulalo.in_?igsh=Mm4yM2xwcGMwdWpx" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram" /></Link>
              <Link href="https://twitter.com/bulalo.in" target="_blank" rel="noreferrer" aria-label="Twitter"><i className="fab fa-twitter" /></Link>
            </div>
          </div>
        </div>

        <div className="site-footer-copyright">
          <p>Made with ❤️ by <Link href="https://codescaler.com">codescaler</Link></p>
          <p>© 2026 Bulalo.in. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
