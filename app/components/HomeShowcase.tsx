import Link from 'next/link';

const categories = [
  {
    href: '/category/restaurants',
    name: 'Restaurants',
    className: 'showcase-category-restaurants',
    icons: ['fas fa-utensils', 'fas fa-hamburger', 'fas fa-coffee'],
  },
  {
    href: '/category/Online-Services',
    name: 'Online Services',
    className: 'showcase-category-online',
    icons: ['fas fa-file-alt', 'fas fa-check-square', 'fas fa-user-check'],
  },
  {
    href: '/category/Equipment',
    name: 'Equipment',
    className: 'showcase-category-equipment',
    icons: ['fas fa-truck', 'fas fa-tractor', 'fas fa-tools'],
  },
];

export default function HomeShowcase() {
  return (
    <section className="home-showcase" aria-label="Popular categories and featured service">
      <div className="showcase-categories">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className={`showcase-category ${category.className}`}
          >
            <div className="showcase-category-art" aria-hidden="true">
              <strong>{category.name}</strong>
              <div className="showcase-category-icons">
                {category.icons.map((icon) => (
                  <i key={icon} className={icon} />
                ))}
              </div>
            </div>
            <span>{category.name}</span>
          </Link>
        ))}
      </div>

      <Link href="/category/security-services" className="showcase-banner">
        <div className="showcase-camera" aria-hidden="true">
          <div className="showcase-camera-body">
            <div className="showcase-camera-lens" />
          </div>
          <div className="showcase-camera-arm" />
        </div>
        <div className="showcase-banner-content">
          <h1>CCTV &amp; Security</h1>
          <div className="showcase-banner-line" />
          <p>Solution</p>
          <span>First choice for security professionals</span>
          <b>Get Best Deals</b>
        </div>
        <div className="showcase-dots" aria-hidden="true">
          <i />
          <i className="active" />
          <i />
          <i />
          <i />
          <i />
        </div>
      </Link>
    </section>
  );
}
