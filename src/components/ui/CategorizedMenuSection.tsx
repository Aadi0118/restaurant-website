import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Sparkles,
  Award,
  Utensils,
  Clock,
  Coffee,
  ChevronDown,
  Search,
  Plus,
  Check,
  X,
  Wheat,
  Soup
} from 'lucide-react';
import { DEFAULT_MENU_ITEMS, MenuItemData } from '../../constants/defaultMenu';

interface CategorizedMenuSectionProps {
  onAddToCart?: (item: any) => void;
  homeMenuItems?: any[];
  onOpenReservation?: () => void;
}

interface CategoryMeta {
  order: number;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  subtitle: string;
  badge?: string;
}

// Logical culinary order & curated metadata for Shree Restaurant categories
const CATEGORY_CONFIG: Record<string, CategoryMeta> = {
  'Indian Rasoi': {
    order: 1,
    icon: Flame,
    subtitle: 'Slow-simmered royal gravies, paneer specialties & authentic dals',
    badge: "Chef's Pride"
  },
  'Tandoor': {
    order: 2,
    icon: Sparkles,
    subtitle: 'Smoky clay-oven marinated tikkas, soya chaap & tandoori delights',
    badge: 'Clay Oven'
  },
  'Roti': {
    order: 3,
    icon: Wheat,
    subtitle: 'Freshly baked butter naans, garlic naans, kulchas & stuffed parathas',
    badge: 'Tandoori Breads'
  },
  'Biriyani': {
    order: 4,
    icon: Award,
    subtitle: 'Aged fragrant Basmati rice sealed & dum-cooked with whole royal spices',
    badge: 'Royal Dum'
  },
  'Rice': {
    order: 5,
    icon: Utensils,
    subtitle: 'Fragrant jeera rice, rich Kashmiri pulao & steamed Basmati grains'
  },
  'Indo-Chinese': {
    order: 6,
    icon: Flame,
    subtitle: 'Wok-tossed spicy chilli paneer, veg manchurian & crispy honey chilli',
    badge: 'Wok Master'
  },
  'Momos': {
    order: 7,
    icon: Sparkles,
    subtitle: 'Steamed, kurkure & pan-fried Himalayan dumplings with fiery red dip',
    badge: 'Himalayan Hit'
  },
  'Noodles': {
    order: 8,
    icon: Utensils,
    subtitle: 'Sizzling wok-tossed Hakka noodles, chilli garlic & Schezwan noodles'
  },
  'Rolls': {
    order: 9,
    icon: Utensils,
    subtitle: 'Golden crispy vegetable spring rolls & wholesome spiced kathi wraps'
  },
  'Early Morning': {
    order: 10,
    icon: Clock,
    subtitle: 'Fluffy Amritsari chole bhature, hot puri bhaji & homestyle breakfast',
    badge: 'Breakfast Special'
  },
  'Soup': {
    order: 11,
    icon: Soup,
    subtitle: 'Warm tomato basil, sweet corn & zesty manchow vegetable broths'
  },
  'Raita': {
    order: 12,
    icon: Sparkles,
    subtitle: 'Chilled spiced yogurt tempered with roasted cumin, boondi & fresh mint'
  },
  'Beverages': {
    order: 13,
    icon: Coffee,
    subtitle: 'Authentic spiced masala chai, rich lassi, cold coffee & refreshers',
    badge: 'Refreshers'
  },
  'Maggi': {
    order: 14,
    icon: Clock,
    subtitle: 'Steaming comfort noodles tossed with golden butter, veggies & spices'
  }
};

export const CategorizedMenuSection: React.FC<CategorizedMenuSectionProps> = ({
  onAddToCart,
  homeMenuItems = [],
  onOpenReservation
}) => {
  // Use loaded items or fallback to full 119 authentic catalog
  const items: MenuItemData[] = useMemo(() => {
    if (homeMenuItems && homeMenuItems.length > 0) {
      return homeMenuItems;
    }
    return DEFAULT_MENU_ITEMS;
  }, [homeMenuItems]);

  // Exclusive active category state: only one category open at a time!
  // Defaults to null so categories are shown first, or click to expand
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  // Group items by category
  const groupedMenu = useMemo(() => {
    return items.reduce((acc, item) => {
      const cat = (item.category || 'Specialties').trim();
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, MenuItemData[]>);
  }, [items]);

  // Sort categories in proper culinary order
  const sortedCategories = useMemo(() => {
    const cats = Object.keys(groupedMenu);
    return cats.sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b]?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });
  }, [groupedMenu]);

  // Filtered items when searching
  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleToggleCategory = (category: string) => {
    // Accordion: if user clicks already open category, collapse it; otherwise close old & open new!
    setActiveCategory((prev) => (prev === category ? null : category));
  };

  const handleAddItem = (item: MenuItemData) => {
    if (onAddToCart) {
      onAddToCart(item);
      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(null), 1600);
    }
  };

  return (
    <section
      id="menu"
      style={{
        position: 'relative',
        padding: 'clamp(4.5rem, 8vw, 8rem) clamp(1.5rem, 5vw, 4rem)',
        background: 'radial-gradient(ellipse at 50% 0%, #173829 0%, #0A0D0B 100%)',
        borderTop: '1px solid rgba(201, 168, 107, 0.18)',
        borderBottom: '1px solid rgba(201, 168, 107, 0.18)',
        color: '#F7F5F0',
        overflow: 'hidden'
      }}
    >
      {/* Anchor for backward compatibility with existing links */}
      <div id="tasting-journey" style={{ position: 'absolute', top: '-100px', left: 0 }} />

      {/* Ambient background glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '400px',
          background: 'radial-gradient(circle, rgba(201, 168, 107, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 4vw, 4rem)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#C9A86B',
              marginBottom: '12px',
              fontWeight: 600
            }}
          >
            <Sparkles size={16} />
            <span>Pure Vegetarian Culinary Heritage</span>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.3rem, 4.5vw, 3.8rem)',
              margin: '0 0 1rem 0',
              fontWeight: 400,
              color: '#F7F5F0',
              letterSpacing: '-0.01em'
            }}
          >
            Explore Our Dining Menu
          </h2>

          <div
            style={{
              width: '80px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #C9A86B, transparent)',
              margin: '0 auto 1.5rem auto'
            }}
          />

          <p
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              color: '#B2ADA3',
              fontSize: '1.05rem',
              lineHeight: '1.8'
            }}
          >
            Select any category below to browse our slow-simmered royal gravies, charcoal tandoor breads,
            fragrant handi biryanis, and refreshing beverages prepared fresh in Rishikesh.
          </p>
        </div>

        {/* Quick Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Search Input Box */}
          <div
            style={{
              position: 'relative',
              maxWidth: '640px',
              width: '100%',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#C9A86B',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none'
              }}
            >
              <Search size={18} />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Paneer Lababdar, Garlic Naan, Dal Makhani)..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.95rem 3rem 0.95rem 3rem',
                borderRadius: '30px',
                background: 'rgba(18, 24, 20, 0.85)',
                border: '1px solid rgba(201, 168, 107, 0.3)',
                color: '#F7F5F0',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                transition: 'border-color 0.25s, box-shadow 0.25s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#C9A86B';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 168, 107, 0.25)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.4)';
              }}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#B2ADA3',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Category Jump Pills */}
          {!searchQuery && (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              {sortedCategories.map((category) => {
                const isActive = activeCategory === category;
                const count = groupedMenu[category]?.length || 0;
                return (
                  <button
                    key={category}
                    onClick={() => handleToggleCategory(category)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '0.55rem 1.1rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 400,
                      cursor: 'pointer',
                      border: isActive
                        ? '1px solid #C9A86B'
                        : '1px solid rgba(201, 168, 107, 0.2)',
                      background: isActive
                        ? 'linear-gradient(135deg, #C9A86B 0%, #DEC085 100%)'
                        : 'rgba(18, 24, 20, 0.65)',
                      color: isActive ? '#0A0D0B' : '#DEC085',
                      boxShadow: isActive ? '0 4px 15px rgba(201, 168, 107, 0.3)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span>{category}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(0, 0, 0, 0.15)' : 'rgba(201, 168, 107, 0.12)',
                        color: isActive ? '#0A0D0B' : '#B2ADA3'
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Results Mode */}
        {filteredSearchResults !== null ? (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(201, 168, 107, 0.2)'
              }}
            >
              <div style={{ color: '#DEC085', fontSize: '1rem', fontWeight: 500 }}>
                Found {filteredSearchResults.length} dishes matching &ldquo;{searchQuery}&rdquo;
              </div>
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#C9A86B',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  textDecoration: 'underline'
                }}
              >
                Clear Search
              </button>
            </div>

            {filteredSearchResults.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'rgba(18, 24, 20, 0.5)',
                  borderRadius: '16px',
                  border: '1px dashed rgba(201, 168, 107, 0.3)',
                  color: '#B2ADA3'
                }}
              >
                <Utensils size={36} style={{ color: '#C9A86B', marginBottom: '12px', opacity: 0.7 }} />
                <h3 style={{ color: '#F7F5F0', margin: '0 0 6px 0' }}>No dishes found</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Try searching for another favorite like &ldquo;Paneer&rdquo;, &ldquo;Dal&rdquo;, &ldquo;Naan&rdquo;, or &ldquo;Biryani&rdquo;.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1.25rem'
                }}
              >
                {filteredSearchResults.map((item) => (
                  <DishCard
                    key={item.id}
                    item={item}
                    onAdd={() => handleAddItem(item)}
                    isAdded={addedItemId === item.id}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Exclusive Accordion Category List */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {sortedCategories.map((category) => {
              const isOpen = activeCategory === category;
              const catConfig: CategoryMeta = CATEGORY_CONFIG[category] || {
                order: 99,
                icon: Utensils,
                subtitle: 'Delicious chef specialties freshly crafted in our pure veg kitchen',
                badge: undefined
              };
              const CatIcon = catConfig.icon;
              const categoryItems = groupedMenu[category] || [];

              return (
                <div
                  key={category}
                  style={{
                    borderRadius: '18px',
                    border: isOpen
                      ? '1px solid rgba(201, 168, 107, 0.5)'
                      : '1px solid rgba(201, 168, 107, 0.18)',
                    background: isOpen
                      ? 'linear-gradient(145deg, rgba(23, 56, 41, 0.7) 0%, rgba(18, 24, 20, 0.9) 100%)'
                      : 'rgba(18, 24, 20, 0.65)',
                    boxShadow: isOpen
                      ? '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(201, 168, 107, 0.12)'
                      : '0 6px 20px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Category Header Row (Clickable) */}
                  <div
                    onClick={() => handleToggleCategory(category)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggleCategory(category);
                      }
                    }}
                    style={{
                      padding: '1.4rem 1.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none',
                      gap: '1.2rem',
                      background: isOpen ? 'rgba(201, 168, 107, 0.05)' : 'transparent'
                    }}
                  >
                    {/* Left: Category Icon & Titles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', minWidth: 0 }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '14px',
                          background: isOpen
                            ? 'linear-gradient(135deg, rgba(201, 168, 107, 0.35), rgba(23, 56, 41, 0.8))'
                            : 'rgba(23, 56, 41, 0.6)',
                          border: isOpen
                            ? '1px solid #C9A86B'
                            : '1px solid rgba(201, 168, 107, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#DEC085',
                          flexShrink: 0,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <CatIcon size={24} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h3
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontSize: 'clamp(1.25rem, 2.5vw, 1.55rem)',
                              margin: 0,
                              fontWeight: 400,
                              color: '#F7F5F0',
                              letterSpacing: '0.01em'
                            }}
                          >
                            {category}
                          </h3>

                          {catConfig.badge && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: '#DEC085',
                                background: 'rgba(201, 168, 107, 0.15)',
                                border: '1px solid rgba(201, 168, 107, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 600
                              }}
                            >
                              {catConfig.badge}
                            </span>
                          )}
                        </div>

                        <p
                          style={{
                            margin: '4px 0 0 0',
                            color: '#B2ADA3',
                            fontSize: '0.88rem',
                            lineHeight: '1.4',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {catConfig.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Item Count & Expand/Collapse Chevron Indicator */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        flexShrink: 0
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: isOpen ? '#DEC085' : '#B2ADA3',
                          background: isOpen ? 'rgba(201, 168, 107, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: isOpen
                            ? '1px solid rgba(201, 168, 107, 0.35)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '20px',
                          fontWeight: 500
                        }}
                      >
                        {categoryItems.length} dishes
                      </span>

                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isOpen ? 'rgba(201, 168, 107, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          border: isOpen ? '1px solid #C9A86B' : '1px solid rgba(201, 168, 107, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isOpen ? '#C9A86B' : '#B2ADA3',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s, color 0.3s'
                        }}
                      >
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content: Renders Dishes Under Category When Open */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            padding: '0 1.8rem 2rem 1.8rem',
                            borderTop: '1px solid rgba(201, 168, 107, 0.15)',
                            background: 'rgba(10, 13, 11, 0.45)'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '1.2rem 0 1rem 0'
                            }}
                          >
                            <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#DEC085' }}>
                              Available in {category}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#6A655E', fontStyle: 'italic' }}>
                              100% Pure Vegetarian Kitchen
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                              gap: '1.25rem'
                            }}
                          >
                            {categoryItems.map((item) => (
                              <DishCard
                                key={item.id}
                                item={item}
                                onAdd={() => handleAddItem(item)}
                                isAdded={addedItemId === item.id}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Callout Bar */}
        <div
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(23, 56, 41, 0.5) 0%, rgba(18, 24, 20, 0.8) 100%)',
            border: '1px solid rgba(201, 168, 107, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DEC085', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <Award size={16} />
            <span>Dining At Shree Restaurant</span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              margin: 0,
              color: '#F7F5F0',
              fontWeight: 400
            }}
          >
            Looking to Host a Gathering or Private Dinner?
          </h3>

          <p style={{ maxWidth: '600px', margin: 0, color: '#B2ADA3', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Reserve a table in advance for you and your family. Freshly prepared North Indian dishes,
            comforting seating, and serene Ganges foothills hospitality.
          </p>

          {onOpenReservation && (
            <button
              onClick={onOpenReservation}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                borderRadius: '30px',
                padding: '0.9rem 2.2rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
                color: '#0A0D0B',
                boxShadow: '0 10px 25px rgba(201, 168, 107, 0.25)'
              }}
            >
              Reserve a Table
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

// Sub-component: Individual Dish Item Card
interface DishCardProps {
  item: MenuItemData;
  onAdd: () => void;
  isAdded: boolean;
}

const DishCard: React.FC<DishCardProps> = ({ item, onAdd, isAdded }) => {
  return (
    <div
      style={{
        padding: '1.35rem',
        borderRadius: '14px',
        background: 'rgba(12, 16, 13, 0.85)',
        border: '1px solid rgba(201, 168, 107, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.35)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.45)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(201, 168, 107, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.16)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.35)';
      }}
    >
      <div>
        {/* Top Header: Veg Indicator Badge & Price */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Green Veg Symbol (Square with green circle) */}
            <div
              title="100% Pure Vegetarian"
              style={{
                width: '15px',
                height: '15px',
                border: '1.5px solid #2ECC71',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#2ECC71'
                }}
              />
            </div>

            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.18rem',
                margin: 0,
                color: '#F7F5F0',
                fontWeight: 500,
                lineHeight: '1.3'
              }}
            >
              {item.name}
            </h4>
          </div>

          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#DEC085',
              fontFamily: 'var(--font-serif)',
              flexShrink: 0
            }}
          >
            ₹{Number(item.price).toFixed(0)}
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            color: '#B2ADA3',
            fontSize: '0.86rem',
            lineHeight: '1.55',
            margin: '0 0 8px 0',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {item.desc || 'Prepared fresh with high quality spices and local ingredients.'}
        </p>
      </div>

      {/* Card Action Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <span
          style={{
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#6A655E'
          }}
        >
          {item.category || 'Specialty'}
        </span>

        <button
          onClick={onAdd}
          aria-label={`Add ${item.name} to order`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.45rem 1.1rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            border: isAdded ? '1px solid #2ECC71' : '1px solid #C9A86B',
            background: isAdded
              ? 'linear-gradient(135deg, #27AE60, #2ECC71)'
              : 'rgba(201, 168, 107, 0.12)',
            color: isAdded ? '#0A0D0B' : '#DEC085',
            boxShadow: isAdded ? '0 4px 12px rgba(46, 204, 113, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (!isAdded) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #C9A86B, #DEC085)';
              e.currentTarget.style.color = '#0A0D0B';
            }
          }}
          onMouseLeave={(e) => {
            if (!isAdded) {
              e.currentTarget.style.background = 'rgba(201, 168, 107, 0.12)';
              e.currentTarget.style.color = '#DEC085';
            }
          }}
        >
          {isAdded ? (
            <>
              <Check size={14} />
              <span>Added!</span>
            </>
          ) : (
            <>
              <Plus size={14} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
