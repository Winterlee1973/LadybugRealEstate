export default function Footer() {
  const footerSections = [
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
      ],
    },
    {
      title: "Explore",
      links: [
        { label: "Homes For Sale", href: "/properties" },
        { label: "Apartments For Rent", href: "#" },
        { label: "Home Values", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Mortgage Calculator", href: "#" },
        { label: "Agent Directory", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#" },
        { label: "Contact Us", href: "#" },
        { label: "Privacy & Terms", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-[hsl(var(--dark-gray))] text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-ladybug font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-sm">© 2024 Ladybug.com. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-1">
            ladybug.com - Your Real Estate Connection.
          </p>
        </div>
      </div>
    </footer>
  );
}
