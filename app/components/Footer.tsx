import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Popular Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Popular Categories</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link href="#" className="hover:text-orange-400">Charging Station</Link>
              <Link href="#" className="hover:text-orange-400">Pandit Ji</Link>
              <Link href="#" className="hover:text-orange-400">Electrician</Link>
              <Link href="#" className="hover:text-orange-400">Beauty Saloon</Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link href="/" className="hover:text-orange-400 block">Home</Link>
              <Link href="/contact-us" className="hover:text-orange-400 block">Contact Us</Link>
              <Link href="/category" className="hover:text-orange-400 block">All Categories</Link>
            </div>
          </div>

          {/* About & Policies */}
          <div>
            <h4 className="font-semibold text-lg mb-4">About & Policies</h4>
            <div className="space-y-2 text-sm">
              <Link href="/about/terms" className="hover:text-orange-400 block">Terms & Conditions</Link>
              <Link href="/about/privacy" className="hover:text-orange-400 block">Privacy Policy</Link>
              <Link href="/about/refund" className="hover:text-orange-400 block">Refund Policy</Link>
            </div>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://facebook.com/bulalo.in" target="_blank" className="hover:text-orange-400">
                <i className="fab fa-facebook-f text-2xl"></i>
              </a>
              <a href="https://instagram.com/bulalo.in" target="_blank" className="hover:text-orange-400">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
              <a href="https://twitter.com/bulalo.in" target="_blank" className="hover:text-orange-400">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>Made with ❤️ by <a href="https://codescaler.com" className="text-orange-400">codescaler</a></p>
          <p className="mt-1">© 2026 Bulalo.in. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
