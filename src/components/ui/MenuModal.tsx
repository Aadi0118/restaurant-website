import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Utensils, Wine, Leaf, X, Plus, Check } from 'lucide-react';
import { MenuItem } from '../../types/dining';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  externalMenuItems?: any[];
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  externalMenuItems = []
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  // Synchronize modal state with native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Light dismiss fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleDialogClick = (event: MouseEvent) => {
      if (event.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!isDialogContent) {
        onClose();
      }
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleDialogClick);
      return () => dialog.removeEventListener('click', handleDialogClick);
    }
  }, [onClose]);

  // Default curated haute tasting menu items (100% elevated fine-dining vegetarian)
  const defaultHauteItems: MenuItem[] = [
    {
      id: 'h-paneer-lababdar',
      name: 'Paneer Lababdar',
      desc: 'Soft artisanal cottage cheese simmered in a luscious tomato, butter, and cashew gravy, delicately finished with fresh cream, royal spices, and chopped cilantro.',
      price: 260,
      category: 'Hearth Signatures',
      tag: "Chef's Signature",
      pairing: 'Slow-Tandoori Butter Naan',
      isChefSpecial: true,
      isVegetarian: true
    },
    {
      id: 'h-veg-biryani',
      name: 'Veg Biriyani',
      desc: 'Slow-steamed in sealed handi with aged Basmati rice, garden fresh vegetables, whole aromatic spices, caramelized onions, and mint.',
      price: 200,
      category: 'Hearth Signatures',
      tag: 'Royal Dum Classic',
      pairing: 'Cooling Burani Raita',
      isChefSpecial: true,
      isVegetarian: true
    },
    {
      id: 'h-chole-bhature',
      name: 'Chole Bhature',
      desc: 'Authentic spiced Amritsari chickpeas infused with dried anardana and secret garam masalas, served with fluffy, crisp golden bhature and pickled onions.',
      price: 90,
      category: 'Traditional Signatures',
      tag: 'Traditional Classic',
      pairing: 'Fresh Mint & Masala Buttermilk',
      isChefSpecial: false,
      isVegetarian: true
    },
    {
      id: 'h4',
      name: 'Truffle & Forest Morel Tartlet',
      desc: 'Flaky herb pastry, caramelized shallot mousse, shaved black Périgord winter truffle, aged botanical emulsion.',
      price: 950,
      category: 'Prelude & Canapés',
      tag: 'Artisan Forage',
      pairing: 'Vintage Brut Champagne',
      isVegetarian: true
    },
    {
      id: 'h5',
      name: 'Charcoal Smoked Marigold Paneer Carpaccio',
      desc: 'Handcrafted cottage cheese infused with organic marigold, wild mint emulsion, charred baby radish, edible blossoms.',
      price: 850,
      category: 'Botanical & Earth',
      tag: 'Himalayan Flora',
      pairing: 'Himalayan Herbal Infusion',
      isVegetarian: true
    },
    {
      id: 'h6',
      name: 'Golden Amber Chocolate Hearth Sphere',
      desc: '72% Valrhona single-origin dark chocolate sphere, warm salted smoked caramel pour-over, gold leaf dusted feuilletine.',
      price: 780,
      category: 'Grand Finale',
      tag: 'Dessert Special',
      pairing: '20-Year Tawny Port',
      isVegetarian: true
    }
  ];

  // Merge external menu items from database if available
  const allItems: MenuItem[] = [
    ...defaultHauteItems,
    ...externalMenuItems.map((item, idx) => ({
      id: item.id || `ext-${idx}`,
      name: item.name,
      desc: item.desc || 'Prepared freshly with authentic Himalayan botanical spices.',
      price: Number(item.price) || 450,
      category: item.category || 'Traditional Kitchen',
      tag: 'Popular',
      isVegetarian: true
    }))
  ];

  const categories = ['all', 'Hearth Signatures', 'Botanical & Earth', 'Prelude & Canapés', 'Grand Finale'];

  const filteredItems = selectedCategory === 'all'
    ? allItems
    : allItems.filter((i) => i.category === selectedCategory);

  const handleAdd = (item: MenuItem) => {
    onAddToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      desc: item.desc,
      category: item.category
    });
    setAddedIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);
  };

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      onClose={onClose}
      aria-labelledby="menu-modal-title"
      style={{
        padding: 0,
        borderRadius: '24px',
        border: '1px solid rgba(201, 168, 107, 0.3)',
        background: '#121814',
        color: '#F7F5F0',
        maxWidth: '780px',
        width: '94vw',
        maxHeight: '88vh',
        boxShadow: '0 30px 100px rgba(0, 0, 0, 0.95), 0 0 50px rgba(201, 168, 107, 0.15)',
        overscrollBehavior: 'contain',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '88vh' }}>
        {/* Modal Header */}
        <div
          style={{
            padding: '1.8rem 2rem 1.2rem',
            borderBottom: '1px solid rgba(201, 168, 107, 0.2)',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(23, 56, 41, 0.6) 0%, rgba(18, 24, 20, 0.95) 100%)'
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              color: '#B2ADA3',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C9A86B', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
            <Sparkles size={14} />
            <span>Elevated Botanical Tasting Collection</span>
          </div>
          <h2 id="menu-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0, color: '#F7F5F0' }}>
            The Botanical Tasting Menu
          </h2>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0 4px', scrollbarWidth: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: selectedCategory === cat ? '1px solid #C9A86B' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedCategory === cat ? 'rgba(23, 56, 41, 0.7)' : 'rgba(255, 255, 255, 0.02)',
                  color: selectedCategory === cat ? '#DEC085' : '#B2ADA3',
                  transition: 'all 0.2s'
                }}
              >
                {cat === 'all' ? 'All Botanical Courses' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '1.2rem',
                borderRadius: '16px',
                background: 'rgba(18, 24, 20, 0.65)',
                border: '1px solid rgba(201, 168, 107, 0.15)',
                transition: 'border-color 0.2s, background 0.2s',
                gap: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.45)';
                e.currentTarget.style.background = 'rgba(23, 56, 41, 0.28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(201, 168, 107, 0.15)';
                e.currentTarget.style.background = 'rgba(18, 24, 20, 0.65)';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, color: '#F7F5F0', fontFamily: 'var(--font-serif)' }}>
                    {item.name}
                  </h3>
                  {item.tag && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        background: 'rgba(23, 56, 41, 0.5)',
                        color: '#DEC085',
                        border: '1px solid rgba(201, 168, 107, 0.35)'
                      }}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>

                <p style={{ margin: '4px 0 8px', color: '#B2ADA3', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  {item.desc}
                </p>

                {item.pairing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C9A86B', fontSize: '0.8rem', fontStyle: 'italic' }}>
                    <Wine size={13} />
                    <span>Sommelier Pairing: {item.pairing}</span>
                  </div>
                )}
              </div>

              {/* Price & Add to Order Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#C9A86B' }}>
                  ₹{item.price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAdd(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: addedIds[item.id] ? '#173829' : 'rgba(201, 168, 107, 0.12)',
                    color: addedIds[item.id] ? '#DEC085' : '#C9A86B',
                    border: addedIds[item.id] ? '1px solid #C9A86B' : '1px solid rgba(201, 168, 107, 0.35)',
                    transition: 'all 0.2s'
                  }}
                >
                  {addedIds[item.id] ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <Plus size={14} /> Add to Tasting
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </dialog>
  );
};

