import React from 'react';

type FooterLinksProps = {
  title: string;
  links: { href?: string; text: string }[];
};

const FooterLinks: React.FC<FooterLinksProps> = ({ title, links }) => {
  return (
    <div>
      <h3 className="text-lg text-[#F05050] font-semibold mb-2">{title}</h3>
      <ul className="space-y-1">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href} className="text-white text-xs hover:underline" target="_blank" rel="noreferrer">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterLinks;
