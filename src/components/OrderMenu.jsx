import { useState, useEffect, useMemo } from 'react';
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
import dishImg from '../assets/paneer_lababdar.png';
import { getMenuItems } from '../services/db';
import { DEFAULT_MENU_ITEMS } from '../constants/defaultMenu';

const CATEGORY_CONFIG = {
  'Indian Rasoi': { order: 1, icon: Flame, subtitle: 'Slow-simmered rich royal gravies & cottage cheese specials' },
  'Tandoor': { order: 2, icon: Sparkles, subtitle: 'Smoky clay-oven marinated tikkas & clay oven favorites' },
  'Roti': { order: 3, icon: Wheat, subtitle: 'Freshly baked butter naans, kulchas & tandoori rotis' },
  'Biriyani': { order: 4, icon: Award, subtitle: 'Aged Basmati dum cooked with aromatic spices & herbs' },
  'Rice': { order: 5, icon: Utensils, subtitle: 'Fragrant jeera rice, rich Kashmiri pulao & steamed grains' },
  'Indo-Chinese': { order: 6, icon: Flame, subtitle: 'Crispy honey chilli, wok-tossed gravies & spicy starters' },
  'Momos': { order: 7, icon: Sparkles, subtitle: 'Steamed, kurkure & wok-fried Himalayan dumplings' },
  'Noodles': { order: 8, icon: Utensils, subtitle: 'Classic Hakka, Schezwan & spicy chilli garlic street noodles' },
  'Rolls': { order: 9, icon: Utensils, subtitle: 'Crispy golden rolls & freshly wrapped kathi rolls' },
  'Early Morning': { order: 10, icon: Clock, subtitle: 'Fluffy Amritsari chole bhature, puri bhaji & breakfast' },
  'Soup': { order: 11, icon: Soup, subtitle: 'Warm comforting broths, sweet corn & zesty manchow soups' },
  'Raita': { order: 12, icon: Sparkles, subtitle: 'Chilled yogurt tempered with roasted cumin, boondi & herbs' },
  'Beverages': { order: 13, icon: Coffee, subtitle: 'Cutting masala chai, refreshing lassis & coolers' },
  'Maggi': { order: 14, icon: Clock, subtitle: 'Steaming spiced noodles made special with butter & veggies' }
};

export default function OrderMenu({ onAddToCart }) {
  const [menuItems, setMenuItems] = useState(DEFAULT_MENU_ITEMS);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItemId, setAddedItemId] = useState(null);

  useEffect(() => {
    getMenuItems()
      .then((items) => {
        if (items && items.length > 0) {
          setMenuItems(items);
        }
      })
      .catch(console.error);
  }, []);

  // Group items by category
  const groupedMenu = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      const cat = (item.category || 'Specialties').trim();
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  // Sort categories according to gastronomic order
  const sortedCategories = useMemo(() => {
    const cats = Object.keys(groupedMenu);
    return cats.sort((a, b) => {
      const orderA = CATEGORY_CONFIG[a]?.order ?? 999;
      const orderB = CATEGORY_CONFIG[b]?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });
  }, [groupedMenu]);

  // Search filter
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.desc && item.desc.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [menuItems, searchQuery]);

  const handleToggleCategory = (category) => {
    // When clicking a category, close previous and show the new one
    setActiveCategory((prev) => (prev === category ? null : category));
  };

  const handleAdd = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(null), 1500);
    }
  };

  return (
    <section className="order-section" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', color: '#F7F5F0', margin: '0 0 0.5rem 0' }}>
          Select Dishes By Category
        </h2>
        <div className="separator" style={{ width: '60px', height: '2px', background: 'var(--color-accent)', margin: '0 auto 1rem auto' }}></div>
        <p style={{ color: '#B2ADA3', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
          Browse our categories in order. Click any category to reveal its dishes; selecting another category collapses the previous one.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
        <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#C9A86B' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search all dishes (e.g. Paneer, Naan, Dal, Biryani)..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.9rem 2.8rem 0.9rem 2.8rem',
            borderRadius: '30px',
            background: 'rgba(18, 24, 20, 0.85)',
            border: '1px solid rgba(201, 168, 107, 0.3)',
            color: '#F7F5F0',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#B2ADA3',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Grid: Category List + Sticky Dish Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '2.5rem', alignItems: 'start' }}>
        {/* Categories / Results Column */}
        <div>
          {searchResults !== null ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#DEC085', fontWeight: 500 }}>Found {searchResults.length} matching dishes</span>
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: '#C9A86B', cursor: 'pointer', textDecoration: 'underline' }}>
                  Clear Search
                </button>
              </div>

              {searchResults.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#B2ADA3', padding: '3rem' }}>No dishes matching &ldquo;{searchQuery}&rdquo;.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {searchResults.map((item) => (
                    <OrderDishCard key={item.id} item={item} onAdd={() => handleAdd(item)} isAdded={addedItemId === item.id} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sortedCategories.map((category) => {
                const isOpen = activeCategory === category;
                const catConfig = CATEGORY_CONFIG[category] || { icon: Utensils, subtitle: 'Freshly prepared dishes' };
                const CatIcon = catConfig.icon;
                const categoryItems = groupedMenu[category] || [];

                return (
                  <div
                    key={category}
                    style={{
                      borderRadius: '16px',
                      border: isOpen ? '1px solid rgba(201, 168, 107, 0.55)' : '1px solid rgba(201, 168, 107, 0.2)',
                      background: isOpen
                        ? 'linear-gradient(145deg, rgba(23, 56, 41, 0.65) 0%, rgba(18, 24, 20, 0.95) 100%)'
                        : 'rgba(18, 24, 20, 0.7)',
                      boxShadow: isOpen ? '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(201, 168, 107, 0.1)' : '0 4px 15px rgba(0,0,0,0.3)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Category Header Row */}
                    <div
                      onClick={() => handleToggleCategory(category)}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '1.25rem 1.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '12px',
                            background: isOpen ? 'rgba(201, 168, 107, 0.25)' : 'rgba(23, 56, 41, 0.6)',
                            border: isOpen ? '1px solid #C9A86B' : '1px solid rgba(201, 168, 107, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#DEC085',
                            flexShrink: 0
                          }}
                        >
                          <CatIcon size={22} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: 0, color: '#F7F5F0', fontWeight: 400 }}>
                            {category}
                          </h3>
                          <p style={{ margin: '3px 0 0 0', color: '#B2ADA3', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {catConfig.subtitle}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.8rem', color: isOpen ? '#DEC085' : '#B2ADA3', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.75rem', borderRadius: '15px' }}>
                          {categoryItems.length} items
                        </span>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isOpen ? 'rgba(201, 168, 107, 0.2)' : 'transparent',
                            color: isOpen ? '#C9A86B' : '#B2ADA3',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                          }}
                        >
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="drawer"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 1.6rem 1.8rem 1.6rem', borderTop: '1px solid rgba(201, 168, 107, 0.15)', background: 'rgba(10, 13, 11, 0.5)' }}>
                            <div style={{ padding: '1rem 0 0.8rem 0', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#DEC085' }}>
                              Dishes in {category}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                              {categoryItems.map((item) => (
                                <OrderDishCard key={item.id} item={item} onAdd={() => handleAdd(item)} isAdded={addedItemId === item.id} />
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
        </div>

        {/* Right Sticky Column: Signature Dish Card */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'rgba(18, 24, 20, 0.75)',
              border: '1px solid rgba(201, 168, 107, 0.25)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
              <img
                src={dishImg}
                alt="Artisanal Paneer Lababdar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 13, 11, 0.9) 0%, transparent 60%)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '16px',
                  right: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#DEC085' }}>
                    Chef&apos;s Signature
                  </span>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0, color: '#F7F5F0' }}>
                    Paneer Lababdar
                  </h4>
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', color: '#C9A86B', fontWeight: 700, fontSize: '1.2rem' }}>
                  ₹280
                </span>
              </div>
            </div>

            <div style={{ padding: '1.4rem' }}>
              <p style={{ color: '#B2ADA3', fontSize: '0.88rem', lineHeight: '1.6', margin: '0 0 1.2rem 0' }}>
                Soft artisanal cottage cheese slow-cooked in a rich tomato, butter, and cashew gravy, delicately infused with roasted kasuri methi.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2ECC71', fontSize: '0.8rem', fontWeight: 500 }}>
                <div style={{ width: '12px', height: '12px', border: '1.5px solid #2ECC71', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ECC71' }} />
                </div>
                <span>100% Pure Vegetarian Kitchen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Compact Dish Card for Order Menu
function OrderDishCard({ item, onAdd, isAdded }) {
  return (
    <div
      style={{
        padding: '1.2rem',
        borderRadius: '12px',
        background: 'rgba(12, 16, 13, 0.85)',
        border: '1px solid rgba(201, 168, 107, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '13px', height: '13px', border: '1.5px solid #2ECC71', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2ECC71' }} />
            </div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', margin: 0, color: '#F7F5F0', fontWeight: 500 }}>
              {item.name}
            </h4>
          </div>
          <span style={{ color: '#DEC085', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem', flexShrink: 0 }}>
            ₹{Number(item.price).toFixed(0)}
          </span>
        </div>
        <p style={{ color: '#B2ADA3', fontSize: '0.82rem', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.desc}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
        <button
          onClick={onAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '0.4rem 1rem',
            borderRadius: '18px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: isAdded ? '1px solid #2ECC71' : '1px solid #C9A86B',
            background: isAdded ? 'linear-gradient(135deg, #27AE60, #2ECC71)' : 'rgba(201, 168, 107, 0.15)',
            color: isAdded ? '#0A0D0B' : '#DEC085',
            transition: 'all 0.2s ease'
          }}
        >
          {isAdded ? (
            <>
              <Check size={14} /> Added!
            </>
          ) : (
            <>
              <Plus size={14} /> Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}
