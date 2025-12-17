'use client';
import React, { useRef, useEffect } from 'react';

type TabsProps = {
  activeTab: number;
  setActiveTab: (tabId: number) => void;
  categories: { id: number; title: string }[];
};

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab, categories }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep active tab visible
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeButton = activeTabRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      
      // Calculate if button is outside visible area
      const isLeftHidden = buttonRect.left < containerRect.left;
      const isRightHidden = buttonRect.right > containerRect.right;
      
      if (isLeftHidden || isRightHidden) {
        const scrollLeft = activeButton.offsetLeft - container.offsetWidth / 2 + activeButton.offsetWidth / 2;
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [activeTab]);

  return (
    <div 
      ref={containerRef}
      className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
      role="tablist"
      aria-label="Menu categories"
    >
      {categories.map(({ id, title }) => {
        const isActive = activeTab === id;
        
        return (
        <button
          key={id}
            ref={isActive ? activeTabRef : null}
          onClick={() => setActiveTab(id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`menu-${id}`}
            className={`
              relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200 ease-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
              ${isActive 
                ? 'bg-[#FF4D4D] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
        >
          {title}
        </button>
        );
      })}
    </div>
  );
};

export default Tabs;
