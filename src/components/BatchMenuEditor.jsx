import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Trash2,
  RotateCcw,
  X,
  Search,
  ArrowUpDown,
  Download,
  Upload,
  Copy,
  CheckCircle2,
  Sparkles,
  Undo2,
  FileSpreadsheet,
  Percent,
  Tag,
  Eye,
  Info
} from 'lucide-react';

export default function BatchMenuEditor({
  menuItems = [],
  onSaveBatch,
  onClose,
  onRefresh
}) {
  // Master draft state
  // Each item: { id, name, desc, price, category, _status: 'original'|'modified'|'created'|'deleted', _original: {...}, _selected: boolean }
  const [draftItems, setDraftItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'CHANGES_ONLY', 'CREATED', 'MODIFIED', 'DELETED'
  const [sortField, setSortField] = useState('name'); // 'name', 'price', 'category', 'status'
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Toolbars state
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReviewDiffModalOpen, setIsReviewDiffModalOpen] = useState(false);
  const [isAddMultipleModalOpen, setIsAddMultipleModalOpen] = useState(false);
  const [multipleRowsCount, setMultipleRowsCount] = useState(3);

  // Bulk Price Form State
  const [priceAdjustType, setPriceAdjustType] = useState('percent_inc'); // 'percent_inc' | 'percent_dec' | 'flat_inc' | 'flat_dec' | 'set_fixed'
  const [priceAdjustValue, setPriceAdjustValue] = useState(10);
  const [roundToNearestTen, setRoundToNearestTen] = useState(true);

  // Bulk Category Form State
  const [bulkCategoryValue, setBulkCategoryValue] = useState('');

  // Import CSV / Text State
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  // Saving & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize draft items from props
  useEffect(() => {
    setDraftItems(
      menuItems.map(item => ({
        id: item.id,
        name: item.name || '',
        desc: item.desc || '',
        price: Number(item.price) || 0,
        category: item.category || 'Uncategorized',
        _status: 'original',
        _original: {
          name: item.name || '',
          desc: item.desc || '',
          price: Number(item.price) || 0,
          category: item.category || 'Uncategorized'
        },
        _selected: false
      }))
    );
  }, [menuItems]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // List of all unique categories in current draft
  const availableCategories = useMemo(() => {
    const set = new Set();
    draftItems.forEach(item => {
      if (item._status !== 'deleted' && item.category) {
        set.add(item.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [draftItems]);

  // Compute pending change metrics
  const changeMetrics = useMemo(() => {
    let created = 0;
    let modified = 0;
    let deleted = 0;
    draftItems.forEach(item => {
      if (item._status === 'created') created++;
      else if (item._status === 'modified') modified++;
      else if (item._status === 'deleted') deleted++;
    });
    return {
      created,
      modified,
      deleted,
      totalChanges: created + modified + deleted
    };
  }, [draftItems]);

  // Selected count
  const selectedCount = useMemo(() => {
    return draftItems.filter(item => item._selected && item._status !== 'deleted').length;
  }, [draftItems]);

  // --- CRUD ACTIONS ---

  // 1. CREATE: Add single empty row
  const handleAddRow = () => {
    const newItem = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: '',
      desc: '',
      price: 150,
      category: availableCategories[0] || 'Main Course',
      _status: 'created',
      _original: null,
      _selected: true
    };
    setDraftItems(prev => [newItem, ...prev]);
    setToastMessage({ type: 'info', text: 'New blank dish row added at top.' });
  };

  // 1. CREATE: Add multiple rows
  const handleAddMultipleRows = (count) => {
    const countNum = Math.max(1, Math.min(25, Number(count) || 3));
    const now = Date.now();
    const newRows = [];
    for (let i = 0; i < countNum; i++) {
      newRows.push({
        id: `new-${now}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        desc: '',
        price: 100,
        category: availableCategories[0] || 'Main Course',
        _status: 'created',
        _original: null,
        _selected: false
      });
    }
    setDraftItems(prev => [...newRows, ...prev]);
    setIsAddMultipleModalOpen(false);
    setToastMessage({ type: 'info', text: `Added ${countNum} new empty rows.` });
  };

  // 1. CREATE: Duplicate row
  const handleDuplicateRow = (itemToClone) => {
    const cloned = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: `${itemToClone.name} (Copy)`,
      desc: itemToClone.desc,
      price: itemToClone.price,
      category: itemToClone.category,
      _status: 'created',
      _original: null,
      _selected: false
    };
    const index = draftItems.findIndex(i => i.id === itemToClone.id);
    const updated = [...draftItems];
    updated.splice(index + 1, 0, cloned);
    setDraftItems(updated);
    setToastMessage({ type: 'info', text: `Cloned "${itemToClone.name}".` });
  };

  // 2. UPDATE: Edit cell in draft
  const handleCellChange = (id, field, value) => {
    setDraftItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        // For newly created items, status stays 'created'
        if (item._status === 'created') {
          return updated;
        }

        // Check if modified compared to original
        const orig = item._original;
        if (!orig) return updated;

        const isModified =
          String(updated.name).trim() !== String(orig.name).trim() ||
          String(updated.desc).trim() !== String(orig.desc).trim() ||
          Number(updated.price) !== Number(orig.price) ||
          String(updated.category).trim() !== String(orig.category).trim();

        return {
          ...updated,
          _status: isModified ? 'modified' : 'original'
        };
      })
    );
  };

  // 2. UPDATE: Revert single row back to original
  const handleRevertRow = (id) => {
    setDraftItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        if (item._status === 'created') return null; // remove newly added
        return {
          ...item,
          name: item._original.name,
          desc: item._original.desc,
          price: item._original.price,
          category: item._original.category,
          _status: 'original'
        };
      }).filter(Boolean)
    );
  };

  // 3. DELETE: Mark row for deletion or remove if created
  const handleToggleDelete = (id) => {
    setDraftItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        if (item._status === 'created') {
          // If it was just created in this batch session, remove from array
          return null;
        }
        return {
          ...item,
          _status: item._status === 'deleted' ? (
            // Restore: check if modified compared to original
            (item.name !== item._original.name || item.price !== item._original.price || item.category !== item._original.category || item.desc !== item._original.desc)
              ? 'modified'
              : 'original'
          ) : 'deleted'
        };
      }).filter(Boolean)
    );
  };

  // Checkbox toggle single item
  const handleToggleSelect = (id) => {
    setDraftItems(prev =>
      prev.map(item => item.id === id ? { ...item, _selected: !item._selected } : item)
    );
  };

  // Select all visible / matching items
  const handleSelectAll = (select) => {
    const visibleIds = new Set(filteredAndSortedItems.map(i => i.id));
    setDraftItems(prev =>
      prev.map(item => visibleIds.has(item.id) ? { ...item, _selected: select } : item)
    );
  };

  // BULK ACTION: Price adjust across selected
  const handleApplyBulkPrice = () => {
    const val = Number(priceAdjustValue);
    if (isNaN(val)) return;

    setDraftItems(prev =>
      prev.map(item => {
        if (!item._selected || item._status === 'deleted') return item;

        let newPrice = Number(item.price) || 0;
        if (priceAdjustType === 'percent_inc') {
          newPrice = newPrice * (1 + val / 100);
        } else if (priceAdjustType === 'percent_dec') {
          newPrice = newPrice * (1 - val / 100);
        } else if (priceAdjustType === 'flat_inc') {
          newPrice = newPrice + val;
        } else if (priceAdjustType === 'flat_dec') {
          newPrice = Math.max(0, newPrice - val);
        } else if (priceAdjustType === 'set_fixed') {
          newPrice = val;
        }

        if (roundToNearestTen) {
          newPrice = Math.round(newPrice / 10) * 10;
        } else {
          newPrice = Math.round(newPrice);
        }

        const updated = { ...item, price: newPrice };
        if (item._status !== 'created') {
          const orig = item._original;
          const isModified =
            orig && (
              updated.name !== orig.name ||
              updated.desc !== orig.desc ||
              Number(updated.price) !== Number(orig.price) ||
              updated.category !== orig.category
            );
          updated._status = isModified ? 'modified' : 'original';
        }
        return updated;
      })
    );

    setIsBulkPriceModalOpen(false);
    setToastMessage({ type: 'success', text: `Updated prices for ${selectedCount} selected items.` });
  };

  // BULK ACTION: Category assign across selected
  const handleApplyBulkCategory = () => {
    const cat = bulkCategoryValue.trim();
    if (!cat) return;

    setDraftItems(prev =>
      prev.map(item => {
        if (!item._selected || item._status === 'deleted') return item;

        const updated = { ...item, category: cat };
        if (item._status !== 'created') {
          const orig = item._original;
          const isModified =
            orig && (
              updated.name !== orig.name ||
              updated.desc !== orig.desc ||
              Number(updated.price) !== Number(orig.price) ||
              updated.category !== orig.category
            );
          updated._status = isModified ? 'modified' : 'original';
        }
        return updated;
      })
    );

    setIsBulkCategoryModalOpen(false);
    setBulkCategoryValue('');
    setToastMessage({ type: 'success', text: `Changed category to "${cat}" for ${selectedCount} items.` });
  };

  // BULK ACTION: Mark selected for deletion
  const handleBulkDeleteSelected = () => {
    if (!window.confirm(`Mark ${selectedCount} selected items for deletion? (You can still review and save or undo)`)) {
      return;
    }

    setDraftItems(prev =>
      prev.map(item => {
        if (!item._selected) return item;
        if (item._status === 'created') return null; // remove draft additions directly
        return { ...item, _status: 'deleted' };
      }).filter(Boolean)
    );

    setToastMessage({ type: 'info', text: `Marked ${selectedCount} items for deletion.` });
  };

  // BULK ACTION: Restore all deleted
  const handleRestoreAllDeleted = () => {
    setDraftItems(prev =>
      prev.map(item => {
        if (item._status !== 'deleted') return item;
        const orig = item._original;
        const isModified = orig && (
          item.name !== orig.name ||
          item.desc !== orig.desc ||
          item.price !== orig.price ||
          item.category !== orig.category
        );
        return {
          ...item,
          _status: isModified ? 'modified' : 'original'
        };
      })
    );
    setToastMessage({ type: 'info', text: 'Restored all deleted items.' });
  };

  // CSV IMPORT: Parse CSV or Tab text
  const handleImportText = () => {
    setImportError('');
    if (!importText.trim()) {
      setImportError('Please paste some CSV or table lines.');
      return;
    }

    const lines = importText.trim().split('\n');
    const newItems = [];
    let skipped = 0;

    lines.forEach((line, index) => {
      // Support comma, semicolon or tab delimiter
      const delimiter = line.includes('\t') ? '\t' : (line.includes(';') ? ';' : ',');
      const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

      // If header line, skip
      if (index === 0 && (parts[0]?.toLowerCase() === 'name' || parts[0]?.toLowerCase() === 'dish')) {
        return;
      }

      if (parts.length >= 2) {
        const name = parts[0];
        const category = parts[1] || 'Main Course';
        const price = Number(parts[2]) || 150;
        const desc = parts.slice(3).join(', ') || '';

        if (name) {
          newItems.push({
            id: `import-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
            name,
            category,
            price,
            desc,
            _status: 'created',
            _original: null,
            _selected: false
          });
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    });

    if (newItems.length === 0) {
      setImportError('No valid dish rows found. Format required: Name, Category, Price, Description');
      return;
    }

    setDraftItems(prev => [...newItems, ...prev]);
    setIsImportModalOpen(false);
    setImportText('');
    setToastMessage({
      type: 'success',
      text: `Imported ${newItems.length} dishes into draft! ${skipped > 0 ? `(${skipped} empty lines skipped)` : ''}`
    });
  };

  // CSV EXPORT: Download as CSV
  const handleExportCSV = () => {
    const activeItems = draftItems.filter(i => i._status !== 'deleted');
    const headers = ['Name', 'Category', 'Price', 'Description'];
    const rows = activeItems.map(item => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      item.price,
      `"${(item.desc || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurant_menu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage({ type: 'info', text: 'Downloaded menu CSV.' });
  };

  // DISCARD ALL CHANGES
  const handleDiscardAll = () => {
    if (changeMetrics.totalChanges === 0) return;
    if (window.confirm('Discard all pending batch edits and reset back to saved menu?')) {
      setDraftItems(
        menuItems.map(item => ({
          id: item.id,
          name: item.name || '',
          desc: item.desc || '',
          price: Number(item.price) || 0,
          category: item.category || 'Uncategorized',
          _status: 'original',
          _original: {
            name: item.name || '',
            desc: item.desc || '',
            price: Number(item.price) || 0,
            category: item.category || 'Uncategorized'
          },
          _selected: false
        }))
      );
      setToastMessage({ type: 'info', text: 'All batch changes discarded.' });
    }
  };

  // SAVE ALL CHANGES IN ONE GO
  const handleSaveAllChanges = async () => {
    if (changeMetrics.totalChanges === 0) {
      setToastMessage({ type: 'info', text: 'No pending changes to save.' });
      return;
    }

    // Validation
    const invalidItems = draftItems.filter(
      item => item._status !== 'deleted' && (!item.name || !item.name.trim() || isNaN(Number(item.price)) || Number(item.price) < 0)
    );

    if (invalidItems.length > 0) {
      alert(`Validation error: ${invalidItems.length} items have missing names or invalid prices. Please review highlighted rows.`);
      return;
    }

    setIsSaving(true);
    try {
      const creates = [];
      const updates = [];
      const deletes = [];

      draftItems.forEach(item => {
        if (item._status === 'created') {
          creates.push({
            name: item.name.trim(),
            desc: item.desc.trim(),
            price: Number(item.price),
            category: item.category.trim()
          });
        } else if (item._status === 'modified') {
          updates.push({
            id: item.id,
            name: item.name.trim(),
            desc: item.desc.trim(),
            price: Number(item.price),
            category: item.category.trim()
          });
        } else if (item._status === 'deleted') {
          deletes.push(item.id);
        }
      });

      if (onSaveBatch) {
        await onSaveBatch({ creates, updates, deletes });
      }

      setToastMessage({
        type: 'success',
        text: `Batch commit successful! (+${creates.length} created, ~${updates.length} updated, -${deletes.length} deleted)`
      });

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Batch save error:', err);
      alert('Error saving batch changes: ' + err.message);
    } finally {
      setIsSaving(false);
      setIsReviewDiffModalOpen(false);
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedItems = useMemo(() => {
    let result = draftItems.filter(item => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      // Category
      const matchesCat =
        selectedCategoryFilter === 'ALL' ||
        item.category.toLowerCase() === selectedCategoryFilter.toLowerCase();

      // Status
      let matchesStatus = true;
      if (statusFilter === 'CHANGES_ONLY') {
        matchesStatus = item._status !== 'original';
      } else if (statusFilter === 'CREATED') {
        matchesStatus = item._status === 'created';
      } else if (statusFilter === 'MODIFIED') {
        matchesStatus = item._status === 'modified';
      } else if (statusFilter === 'DELETED') {
        matchesStatus = item._status === 'deleted';
      }

      return matchesSearch && matchesCat && matchesStatus;
    });

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'price') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return sortAsc ? valA - valB : valB - valA;
      }

      if (sortField === 'status') {
        valA = a._status;
        valB = b._status;
      }

      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return result;
  }, [draftItems, searchQuery, selectedCategoryFilter, statusFilter, sortField, sortAsc]);

  const allVisibleSelected =
    filteredAndSortedItems.length > 0 &&
    filteredAndSortedItems.every(i => i._selected);

  const someVisibleSelected =
    filteredAndSortedItems.some(i => i._selected) && !allVisibleSelected;

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '90px' }}>
      {/* DATALIST FOR CATEGORIES AUTOCOMPLETE */}
      <datalist id="batch-categories-list">
        {availableCategories.map(cat => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      {/* TOAST FEEDBACK NOTIFICATION */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '25px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '10px',
            background: toastMessage.type === 'success' ? '#064E3B' : toastMessage.type === 'info' ? '#1E293B' : '#7F1D1D',
            color: '#F7F5F0',
            border: `1px solid ${toastMessage.type === 'success' ? '#10B981' : toastMessage.type === 'info' ? '#38BDF8' : '#F87171'}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            fontSize: '0.9rem',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} color="#34D399" /> : <Info size={18} color="#38BDF8" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* TOP HEADER CONTROLS */}
      <div
        style={{
          background: 'var(--color-surface)',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          border: 'var(--glass-border)',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #C9A86B, #DEC085)', padding: '6px', borderRadius: '8px', color: '#0A0D0B' }}>
                <Sparkles size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#F7F5F0', fontFamily: 'var(--font-serif)' }}>
                Batch CRUD Studio
              </h3>
              <span
                style={{
                  background: 'rgba(201, 168, 107, 0.15)',
                  color: 'var(--color-accent)',
                  border: '1px solid rgba(201, 168, 107, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                All-in-One Live Matrix
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              Create, edit, duplicate, and delete multiple dishes in real-time. Apply all changes atomically in one go.
            </p>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleAddRow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #C9A86B, #DEC085)',
                color: '#0A0D0B',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(201, 168, 107, 0.3)'
              }}
            >
              <Plus size={16} /> + Add Blank Row
            </button>

            <button
              onClick={() => setIsAddMultipleModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F7F5F0',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Add Multiple...
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#F7F5F0',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Bulk import dishes via CSV or pasted lines"
            >
              <Upload size={15} /> Import CSV
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 0.9rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#DEC085',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Download full menu as CSV spreadsheet"
            >
              <Download size={15} /> Export CSV
            </button>

            {onClose && (
              <button
                onClick={onClose}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Standard View
              </button>
            )}
          </div>
        </div>

        {/* SEARCH, CATEGORY PILLS & STATUS FILTER */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search dish, category or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.8rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid rgba(201, 168, 107, 0.25)',
                background: 'rgba(0,0,0,0.3)',
                color: '#F7F5F0',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Change Status Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginRight: '4px' }}>Filter:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: statusFilter === 'ALL' ? '1px solid #C9A86B' : '1px solid rgba(255,255,255,0.1)',
                background: statusFilter === 'ALL' ? 'rgba(201, 168, 107, 0.2)' : 'transparent',
                color: statusFilter === 'ALL' ? '#DEC085' : '#9CA3AF'
              }}
            >
              All ({draftItems.length})
            </button>
            <button
              onClick={() => setStatusFilter('CHANGES_ONLY')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: statusFilter === 'CHANGES_ONLY' ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.1)',
                background: statusFilter === 'CHANGES_ONLY' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: statusFilter === 'CHANGES_ONLY' ? '#38BDF8' : '#9CA3AF'
              }}
            >
              Pending Edits ({changeMetrics.totalChanges})
            </button>
            {changeMetrics.created > 0 && (
              <button
                onClick={() => setStatusFilter('CREATED')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: statusFilter === 'CREATED' ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
                  background: statusFilter === 'CREATED' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: statusFilter === 'CREATED' ? '#34D399' : '#9CA3AF'
                }}
              >
                + New ({changeMetrics.created})
              </button>
            )}
            {changeMetrics.modified > 0 && (
              <button
                onClick={() => setStatusFilter('MODIFIED')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: statusFilter === 'MODIFIED' ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
                  background: statusFilter === 'MODIFIED' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: statusFilter === 'MODIFIED' ? '#FBBF24' : '#9CA3AF'
                }}
              >
                ✏️ Modified ({changeMetrics.modified})
              </button>
            )}
            {changeMetrics.deleted > 0 && (
              <button
                onClick={() => setStatusFilter('DELETED')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: statusFilter === 'DELETED' ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                  background: statusFilter === 'DELETED' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  color: statusFilter === 'DELETED' ? '#F87171' : '#9CA3AF'
                }}
              >
                🗑️ Deleted ({changeMetrics.deleted})
              </button>
            )}
            {changeMetrics.deleted > 0 && (
              <button
                onClick={handleRestoreAllDeleted}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#D1D5DB',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
                title="Restore all marked deleted dishes back to active"
              >
                <RotateCcw size={11} /> Restore All
              </button>
            )}
          </div>

          {/* Category Quick Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(201, 168, 107, 0.25)',
                color: '#DEC085',
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* BULK SELECTION ACTION TOOLBAR (Appears when items are selected) */}
        {selectedCount > 0 && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'rgba(201, 168, 107, 0.12)',
              border: '1px solid rgba(201, 168, 107, 0.35)',
              borderRadius: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.8rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: 'var(--color-accent)',
                  color: '#0A0D0B',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem'
                }}
              >
                {selectedCount} Selected
              </span>
              <span style={{ color: '#F7F5F0', fontSize: '0.85rem' }}>
                Apply batch operation to all selected rows:
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setIsBulkPriceModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(201, 168, 107, 0.3)',
                  color: '#DEC085',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Percent size={14} /> Adjust Prices (% or ₹)
              </button>

              <button
                onClick={() => setIsBulkCategoryModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(201, 168, 107, 0.3)',
                  color: '#DEC085',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Tag size={14} /> Assign Category
              </button>

              <button
                onClick={handleBulkDeleteSelected}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#F87171',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} /> Mark for Deletion
              </button>

              <button
                onClick={() => handleSelectAll(false)}
                style={{
                  padding: '0.45rem 0.7rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SPREADSHEET MATRIX TABLE */}
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          border: 'var(--glass-border)',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Select All Checkbox */}
                <th style={{ width: '45px', padding: '1rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={el => { if (el) el.indeterminate = someVisibleSelected; }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: 'pointer', transform: 'scale(1.15)', accentColor: '#C9A86B' }}
                    title="Select/Deselect All Visible"
                  />
                </th>

                {/* Status Column */}
                <th
                  onClick={() => { setSortField('status'); setSortAsc(!sortAsc); }}
                  style={{ width: '100px', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Status <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* Dish Name */}
                <th
                  onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                  style={{ width: '220px', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Dish Name <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* Category */}
                <th
                  onClick={() => { setSortField('category'); setSortAsc(!sortAsc); }}
                  style={{ width: '170px', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Category <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* Price */}
                <th
                  onClick={() => { setSortField('price'); setSortAsc(!sortAsc); }}
                  style={{ width: '140px', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Price (₹) <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* Description */}
                <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Description / Ingredients
                </th>

                {/* Row Actions */}
                <th style={{ width: '120px', padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <FileSpreadsheet size={36} color="var(--color-accent)" opacity={0.6} />
                      <span style={{ fontSize: '1rem', color: '#F7F5F0' }}>No dishes match the selected filters.</span>
                      <button
                        onClick={handleAddRow}
                        style={{
                          marginTop: '6px',
                          background: 'rgba(201, 168, 107, 0.2)',
                          border: '1px solid #C9A86B',
                          color: '#DEC085',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        + Add a New Dish Row
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedItems.map((item, index) => {
                  const isDeleted = item._status === 'deleted';
                  const isCreated = item._status === 'created';
                  const isModified = item._status === 'modified';

                  let rowBg = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)';
                  let borderLeft = '4px solid transparent';

                  if (isDeleted) {
                    rowBg = 'rgba(239, 68, 68, 0.08)';
                    borderLeft = '4px solid #EF4444';
                  } else if (isCreated) {
                    rowBg = 'rgba(16, 185, 129, 0.08)';
                    borderLeft = '4px solid #10B981';
                  } else if (isModified) {
                    rowBg = 'rgba(245, 158, 11, 0.08)';
                    borderLeft = '4px solid #F59E0B';
                  }

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        background: rowBg,
                        borderLeft: borderLeft,
                        opacity: isDeleted ? 0.6 : 1,
                        transition: 'background 0.2s',
                        verticalAlign: 'top'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={item._selected}
                          disabled={isDeleted}
                          onChange={() => handleToggleSelect(item.id)}
                          style={{ cursor: isDeleted ? 'not-allowed' : 'pointer', transform: 'scale(1.15)', accentColor: '#C9A86B' }}
                        />
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '0.8rem 1rem' }}>
                        {isCreated && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#34D399',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            + NEW
                          </span>
                        )}
                        {isModified && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#FBBF24',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                            title={`Original: ${item._original?.name} (₹${item._original?.price}) in ${item._original?.category}`}
                          >
                            MODIFIED
                          </span>
                        )}
                        {isDeleted && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            DELETE
                          </span>
                        )}
                        {!isCreated && !isModified && !isDeleted && (
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                            Saved
                          </span>
                        )}
                      </td>

                      {/* Dish Name Input */}
                      <td style={{ padding: '0.8rem 0.6rem' }}>
                        <input
                          type="text"
                          value={item.name}
                          disabled={isDeleted}
                          onChange={(e) => handleCellChange(item.id, 'name', e.target.value)}
                          placeholder="Dish Name (e.g. Dal Makhani)"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isDeleted ? 'transparent' : 'rgba(0,0,0,0.3)',
                            border: !item.name.trim() ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                            color: isDeleted ? '#9CA3AF' : '#F7F5F0',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            outline: 'none',
                            textDecoration: isDeleted ? 'line-through' : 'none'
                          }}
                        />
                        {isModified && item.name !== item._original?.name && (
                          <div style={{ fontSize: '0.7rem', color: '#FBBF24', marginTop: '2px' }}>
                            Was: {item._original?.name}
                          </div>
                        )}
                      </td>

                      {/* Category Input / Datalist */}
                      <td style={{ padding: '0.8rem 0.6rem' }}>
                        <input
                          type="text"
                          list="batch-categories-list"
                          value={item.category}
                          disabled={isDeleted}
                          onChange={(e) => handleCellChange(item.id, 'category', e.target.value)}
                          placeholder="Category"
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isDeleted ? 'transparent' : 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: isDeleted ? '#9CA3AF' : '#DEC085',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            outline: 'none'
                          }}
                        />
                        {isModified && item.category !== item._original?.category && (
                          <div style={{ fontSize: '0.7rem', color: '#FBBF24', marginTop: '2px' }}>
                            Was: {item._original?.category}
                          </div>
                        )}
                      </td>

                      {/* Price Input with Quick Stepper */}
                      <td style={{ padding: '0.8rem 0.6rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '0.9rem' }}>₹</span>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={item.price}
                            disabled={isDeleted}
                            onChange={(e) => handleCellChange(item.id, 'price', e.target.value)}
                            style={{
                              width: '80px',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              background: isDeleted ? 'transparent' : 'rgba(0,0,0,0.3)',
                              border: isNaN(Number(item.price)) || Number(item.price) < 0 ? '1px solid #EF4444' : '1px solid rgba(255,255,255,0.1)',
                              color: isDeleted ? '#9CA3AF' : '#F7F5F0',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                        {isModified && Number(item.price) !== Number(item._original?.price) && (
                          <div style={{ fontSize: '0.7rem', color: '#FBBF24', marginTop: '2px' }}>
                            Was: ₹{item._original?.price}
                          </div>
                        )}
                      </td>

                      {/* Description Input */}
                      <td style={{ padding: '0.8rem 0.6rem' }}>
                        <textarea
                          rows={1}
                          value={item.desc}
                          disabled={isDeleted}
                          onChange={(e) => handleCellChange(item.id, 'desc', e.target.value)}
                          placeholder="Description, spices, aroma..."
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: isDeleted ? 'transparent' : 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: isDeleted ? '#9CA3AF' : 'var(--color-text-muted)',
                            fontSize: '0.82rem',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '34px',
                            lineHeight: 1.3
                          }}
                        />
                      </td>

                      {/* Row Actions */}
                      <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {/* Revert single row button if modified */}
                          {isModified && (
                            <button
                              onClick={() => handleRevertRow(item.id)}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#DEC085',
                                borderRadius: '6px',
                                padding: '5px 7px',
                                cursor: 'pointer'
                              }}
                              title="Revert this row to original"
                            >
                              <Undo2 size={14} />
                            </button>
                          )}

                          {/* Clone/Duplicate Row Button */}
                          {!isDeleted && (
                            <button
                              onClick={() => handleDuplicateRow(item)}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: '#E2E8F0',
                                borderRadius: '6px',
                                padding: '5px 7px',
                                cursor: 'pointer'
                              }}
                              title="Duplicate / Clone this dish"
                            >
                              <Copy size={14} />
                            </button>
                          )}

                          {/* Delete or Restore Toggle */}
                          {isDeleted ? (
                            <button
                              onClick={() => handleToggleDelete(item.id)}
                              style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                border: '1px solid #10B981',
                                color: '#34D399',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                              title="Restore this item"
                            >
                              <RotateCcw size={13} /> Undo
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleDelete(item.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#F87171',
                                borderRadius: '6px',
                                padding: '5px 7px',
                                cursor: 'pointer'
                              }}
                              title={isCreated ? 'Remove draft row' : 'Mark for deletion'}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FLOATING STICKY ACTION BAR (COMMIT ALL IN ONE GO)        */}
      {/* ======================================================== */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: '1100px',
          background: 'rgba(18, 24, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(201, 168, 107, 0.4)',
          borderRadius: '16px',
          padding: '0.9rem 1.6rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 9000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(201, 168, 107, 0.25)'
        }}
      >
        {/* Left: Change Summary Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#F7F5F0' }}>
              Pending Changes:
            </span>
            {changeMetrics.totalChanges === 0 ? (
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                All dishes are up to date.
              </span>
            ) : (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {changeMetrics.created > 0 && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#34D399', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    +{changeMetrics.created} New
                  </span>
                )}
                {changeMetrics.modified > 0 && (
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #F59E0B', color: '#FBBF24', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    ~{changeMetrics.modified} Modified
                  </span>
                )}
                {changeMetrics.deleted > 0 && (
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#F87171', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    -{changeMetrics.deleted} To Delete
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Discard, Review Diff, and Commit in One Go Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {changeMetrics.totalChanges > 0 && (
            <>
              <button
                onClick={handleDiscardAll}
                disabled={isSaving}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-text-muted)',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Discard All
              </button>

              <button
                onClick={() => setIsReviewDiffModalOpen(true)}
                disabled={isSaving}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#F7F5F0',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={15} /> Review Diff
              </button>
            </>
          )}

          <button
            onClick={handleSaveAllChanges}
            disabled={isSaving || changeMetrics.totalChanges === 0}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1.4rem',
              borderRadius: '8px',
              background: changeMetrics.totalChanges > 0 ? 'linear-gradient(135deg, #C9A86B, #DEC085)' : 'rgba(255,255,255,0.1)',
              color: changeMetrics.totalChanges > 0 ? '#0A0D0B' : 'rgba(255,255,255,0.3)',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: changeMetrics.totalChanges > 0 && !isSaving ? 'pointer' : 'not-allowed',
              boxShadow: changeMetrics.totalChanges > 0 ? '0 4px 20px rgba(201, 168, 107, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {isSaving ? (
              <>Saving Batch Changes...</>
            ) : (
              <>
                <Sparkles size={17} />
                Save All Changes in One Go {changeMetrics.totalChanges > 0 ? `(${changeMetrics.totalChanges})` : ''}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: BULK PRICE ADJUSTER                             */}
      {/* ======================================================== */}
      {isBulkPriceModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#121814',
              border: '2px solid #C9A86B',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#F7F5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Percent size={18} color="#C9A86B" /> Bulk Adjust Prices
              </h4>
              <button onClick={() => setIsBulkPriceModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Modify prices for <strong>{selectedCount}</strong> selected dishes simultaneously.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Adjustment Method
                </label>
                <select
                  value={priceAdjustType}
                  onChange={(e) => setPriceAdjustType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#1A231D',
                    border: '1px solid rgba(201, 168, 107, 0.3)',
                    color: '#F7F5F0',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="percent_inc">Increase by Percentage (%)</option>
                  <option value="percent_dec">Discount by Percentage (%)</option>
                  <option value="flat_inc">Increase by Fixed Rupees (₹)</option>
                  <option value="flat_dec">Discount by Fixed Rupees (₹)</option>
                  <option value="set_fixed">Set to Fixed Price (₹)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  {priceAdjustType.includes('percent') ? 'Percentage Value (%)' : 'Amount in Rupees (₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={priceAdjustValue}
                  onChange={(e) => setPriceAdjustValue(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#1A231D',
                    border: '1px solid rgba(201, 168, 107, 0.3)',
                    color: '#F7F5F0',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="roundNearest"
                  checked={roundToNearestTen}
                  onChange={(e) => setRoundToNearestTen(e.target.checked)}
                  style={{ accentColor: '#C9A86B', cursor: 'pointer' }}
                />
                <label htmlFor="roundNearest" style={{ fontSize: '0.85rem', color: '#D1D5DB', cursor: 'pointer' }}>
                  Round calculated prices to nearest ₹10 (e.g. ₹234 → ₹230)
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsBulkPriceModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-text-muted)', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkPrice}
                style={{ background: 'linear-gradient(135deg, #C9A86B, #DEC085)', border: 'none', color: '#0A0D0B', fontWeight: 700, padding: '0.55rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Apply to {selectedCount} Dishes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: BULK CATEGORY ASSIGNMENT                        */}
      {/* ======================================================== */}
      {isBulkCategoryModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#121814',
              border: '2px solid #C9A86B',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#F7F5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={18} color="#C9A86B" /> Assign Category in Bulk
              </h4>
              <button onClick={() => setIsBulkCategoryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              Change the category for all <strong>{selectedCount}</strong> selected dishes:
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Target Category (choose or type new)
              </label>
              <input
                type="text"
                list="batch-categories-list"
                value={bulkCategoryValue}
                onChange={(e) => setBulkCategoryValue(e.target.value)}
                placeholder="e.g. Starters & Appetizers"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: '#1A231D',
                  border: '1px solid rgba(201, 168, 107, 0.3)',
                  color: '#F7F5F0',
                  fontSize: '0.95rem'
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {availableCategories.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setBulkCategoryValue(cat)}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#DEC085',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsBulkCategoryModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-text-muted)', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkCategory}
                style={{ background: 'linear-gradient(135deg, #C9A86B, #DEC085)', border: 'none', color: '#0A0D0B', fontWeight: 700, padding: '0.55rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Apply Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: IMPORT CSV / RAW TEXT                           */}
      {/* ======================================================== */}
      {isImportModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#121814',
              border: '2px solid #C9A86B',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#F7F5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={18} color="#C9A86B" /> Bulk Import Menu Items
              </h4>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
              Paste lines from Excel, Google Sheets, or a CSV file. Each row should follow the format:
              <br />
              <code style={{ background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px', color: '#DEC085' }}>
                Name, Category, Price, Description
              </code>
            </p>

            {importError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#F87171', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {importError}
              </div>
            )}

            <textarea
              rows={8}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`Shahi Korma, Main Course, 280, Rich spiced cashew and cream gravy\nTandoori Roti, Roti & Tandoor, 25, Crisp flatbread baked in clay oven\nKesar Pista Kulfi, Desserts, 110, Traditional slow-churned saffron pistachio ice cream`}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#1A231D',
                border: '1px solid rgba(201, 168, 107, 0.3)',
                color: '#F7F5F0',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                outline: 'none',
                marginBottom: '1.2rem'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Tip: Items are added to draft for review before saving.
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-text-muted)', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportText}
                  style={{ background: 'linear-gradient(135deg, #C9A86B, #DEC085)', border: 'none', color: '#0A0D0B', fontWeight: 700, padding: '0.55rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Import into Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADD MULTIPLE BLANK ROWS                         */}
      {/* ======================================================== */}
      {isAddMultipleModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#121814',
              border: '2px solid #C9A86B',
              borderRadius: '16px',
              maxWidth: '420px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#F7F5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#C9A86B" /> Add Multiple Blank Rows
              </h4>
              <button onClick={() => setIsAddMultipleModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              How many blank dish rows would you like to insert into the matrix?
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              {[3, 5, 10, 15].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMultipleRowsCount(num)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: multipleRowsCount === num ? '1px solid #C9A86B' : '1px solid rgba(255,255,255,0.1)',
                    background: multipleRowsCount === num ? 'rgba(201, 168, 107, 0.25)' : 'rgba(255,255,255,0.05)',
                    color: multipleRowsCount === num ? '#DEC085' : '#D1D5DB'
                  }}
                >
                  +{num}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsAddMultipleModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-text-muted)', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddMultipleRows(multipleRowsCount)}
                style={{ background: 'linear-gradient(135deg, #C9A86B, #DEC085)', border: 'none', color: '#0A0D0B', fontWeight: 700, padding: '0.55rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Insert {multipleRowsCount} Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REVIEW PENDING DIFF                             */}
      {/* ======================================================== */}
      {isReviewDiffModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#121814',
              border: '2px solid #C9A86B',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#F7F5F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#C9A86B" /> Batch Changes Review
              </h4>
              <button onClick={() => setIsReviewDiffModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Review the exact additions, edits, and deletions before committing them to the live restaurant database:
            </p>

            {/* Creations */}
            {changeMetrics.created > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#34D399', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> New Dishes to Add ({changeMetrics.created})
                </h5>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '0.8rem' }}>
                  {draftItems.filter(i => i._status === 'created').map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600, color: '#F7F5F0' }}>{item.name || '(Unnamed Dish)'} <span style={{ color: '#9CA3AF', fontWeight: 'normal' }}>({item.category})</span></span>
                      <span style={{ color: '#34D399', fontWeight: 700 }}>₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modifications */}
            {changeMetrics.modified > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#FBBF24', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✏️ Dishes to Update ({changeMetrics.modified})
                </h5>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '0.8rem' }}>
                  {draftItems.filter(i => i._status === 'modified').map((item, idx) => {
                    const orig = item._original;
                    return (
                      <div key={idx} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#F7F5F0' }}>
                          <span>{item.name}</span>
                          <span>₹{item.price}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#FBBF24', marginTop: '2px', display: 'flex', gap: '15px' }}>
                          {item.name !== orig.name && <span>Name: &quot;{orig.name}&quot; → &quot;{item.name}&quot;</span>}
                          {Number(item.price) !== Number(orig.price) && <span>Price: ₹{orig.price} → ₹{item.price}</span>}
                          {item.category !== orig.category && <span>Category: &quot;{orig.category}&quot; → &quot;{item.category}&quot;</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deletions */}
            {changeMetrics.deleted > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: '#F87171', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trash2 size={16} /> Dishes to Delete ({changeMetrics.deleted})
                </h5>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.8rem' }}>
                  {draftItems.filter(i => i._status === 'deleted').map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#F87171' }}>
                      <span style={{ textDecoration: 'line-through' }}>{item.name} ({item.category})</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setIsReviewDiffModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--color-text-muted)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleSaveAllChanges}
                disabled={isSaving}
                style={{ background: 'linear-gradient(135deg, #C9A86B, #DEC085)', border: 'none', color: '#0A0D0B', fontWeight: 800, padding: '0.65rem 1.4rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Confirm & Commit All Changes Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
