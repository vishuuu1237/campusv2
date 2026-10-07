import { Link } from 'react-router-dom';
import TradeHubLogo from './TradeHubLogo';

const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 mt-space-xl">
      <div className="max-w-[1360px] mx-auto px-4 md:px-margin pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-lg pb-space-xl">
          {/* Brand info */}
          <div className="lg:col-span-2 flex flex-col gap-space-sm pr-space-lg">
            <Link to="/" className="inline-block">
              <TradeHubLogo className="h-8" />
            </Link>
            <p className="font-body-md text-on-surface-variant max-w-sm mt-1">
              The peer-to-peer campus commerce standard connecting verified students and trusted sellers with zero-friction escrow security and instant resolution.
            </p>
            <div className="flex flex-wrap items-center gap-space-sm mt-space-xs">
              <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low font-label-sm text-tertiary-container font-semibold">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                Buyer Guarantee
              </span>
              <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container-low font-label-sm text-secondary font-semibold">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Escrow Protected
              </span>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-headline-sm text-on-surface">Marketplace</h4>
            <nav className="flex flex-col gap-2 font-body-md text-on-surface-variant">
              <Link to="/" className="hover:text-primary transition-colors">
                All Listings
              </Link>
              <Link to="/?category=Textbooks" className="hover:text-primary transition-colors">
                Textbooks Hub
              </Link>
              <Link to="/?category=Electronics" className="hover:text-primary transition-colors">
                Electronics & Tech
              </Link>
              <Link to="/?category=Furniture" className="hover:text-primary transition-colors">
                Dorm Furniture
              </Link>
              <Link to="/?category=Sports" className="hover:text-primary transition-colors">
                Sports & Hobbies
              </Link>
            </nav>
          </div>

          {/* Column 2: Safety & Trust */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-headline-sm text-on-surface">Safety & Trust</h4>
            <nav className="flex flex-col gap-2 font-body-md text-on-surface-variant">
              <span className="text-on-surface-variant/80 hover:text-primary cursor-pointer transition-colors">
                100% Escrow Protection
              </span>
              <span className="text-on-surface-variant/80 hover:text-primary cursor-pointer transition-colors">
                Campus ID Verification
              </span>
              <span className="text-on-surface-variant/80 hover:text-primary cursor-pointer transition-colors">
                Safe Handoff Zones
              </span>
              <span className="text-on-surface-variant/80 hover:text-primary cursor-pointer transition-colors">
                Dispute Resolution
              </span>
            </nav>
          </div>

          {/* Column 3: Seller Tools */}
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-headline-sm text-on-surface">Seller Tools</h4>
            <nav className="flex flex-col gap-2 font-body-md text-on-surface-variant">
              <Link to="/sell" className="hover:text-primary transition-colors">
                Post an Item
              </Link>
              <Link to="/my-products" className="hover:text-primary transition-colors">
                My Listed Products
              </Link>
              <Link to="/orders" className="hover:text-primary transition-colors">
                My Orders
              </Link>
              <span className="text-on-surface-variant/80 hover:text-primary cursor-pointer transition-colors">
                Zero Listing Fees
              </span>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-space-md border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-space-sm font-body-sm text-on-surface-variant">
          <p>© {new Date().getFullYear()} TradeHub Peer Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-space-md">
            <span className="hover:text-on-surface transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-on-surface transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-on-surface transition-colors cursor-pointer">Security Disclosures</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
