import React, { useState, useMemo, useCallback } from "react";
import { useAuth } from "../../../App/Providers/AuthProvider";


const G = {
  accent1: "#E1761B",
  accent2: "#2A02A0",
  red:     "#EF4444",
  green:   "#10B981",
  slate0:  "#0F172A",
  slate5:  "#64748B",
  slate6:  "#94A3B8",
  slate8:  "#CBD5E1",
  slateE:  "#E2E8F0",
  slateF1: "#F1F5F9",
  slateF8: "#F8FAFC",
  slateFa: "#FAFBFC",
};
const gradBrand = `linear-gradient(135deg, ${G.accent1} 0%, ${G.accent2} 100%)`;

const getVal = (obj, path) => {
  if (!path) return obj;
  return path.split(".").reduce((cur, k) => cur?.[k], obj);
};

/* ═══════════════════════════════════════════════════════════
   PERMISSION RESOLVER
   
   Logic:
     1. If permissionKey provided → read user.permissions[permissionKey] (array like ['view','edit','delete','add'])
     2. enable* props act as additional gate (AND logic):
        - If permissionKey present:  canEdit = permissionHasEdit AND enableEdit !== false
        - If no permissionKey:       canEdit = !!enableEdit  (original behavior)
   
   This means:
     - permissionKey="books" + enableDelete={false}  → delete hidden even if user has permission
     - permissionKey="books" (no enableX props)      → fully driven by permission array
     - No permissionKey + enableAdd={true}           → old manual behavior
═══════════════════════════════════════════════════════════ */
const useResolvedPermissions = ({
  permissionKey,
  enableAdd,
  enableEdit,
  enableDelete,
  enableView,
}) => {
  const { user } = useAuth();

  if (permissionKey) {
    const perms = user?.permissions?.[permissionKey] ?? [];
    return {
      canAdd:    perms.includes("add")    && enableAdd    !== false,
      canEdit:   perms.includes("edit")   && enableEdit   !== false,
      canDelete: perms.includes("delete") && enableDelete !== false,
      canView:   perms.includes("view")   && enableView   !== false,
    };
  }

  // No permissionKey → purely driven by enable* props
  return {
    canAdd:    !!enableAdd,
    canEdit:   !!enableEdit,
    canDelete: !!enableDelete,
    canView:   !!enableView,
  };
};

/* ═══════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
═══════════════════════════════════════════════════════════ */
const DeleteModal = ({ item, columns, onConfirm, onCancel }) => {
  const label =
    getVal(item, "name") ||
    getVal(item, "title") ||
    getVal(item, columns?.[0]?.key) ||
    `#${item.id}`;

  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1200, animation: "fadeO .2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: 18, width: "90%", maxWidth: 440,
        boxShadow: "0 28px 64px rgba(0,0,0,.28)", overflow: "hidden",
        animation: "slideM .26s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{
          padding: "18px 22px", borderBottom: `1.5px solid ${G.slateF1}`,
          background: G.slateFa, display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "rgba(239,68,68,.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={G.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: G.slate0 }}>Устгахдаа итгэлтэй байна уу?</div>
            <div style={{ fontSize: 12, color: G.slate5, marginTop: 2 }}>Энэ үйлдлийг буцаах боломжгүй</div>
          </div>
        </div>
        <div style={{ padding: "18px 22px" }}>
          <div style={{
            background: "rgba(239,68,68,.05)", border: "1.5px solid rgba(239,68,68,.18)",
            borderRadius: 10, padding: "12px 16px", fontSize: 13, color: G.slate0, fontWeight: 500,
          }}>
            <span style={{ color: G.slate5 }}>Устгах өгөгдөл: </span>
            <strong>{String(label)}</strong>
          </div>
        </div>
        <div style={{
          padding: "14px 22px", borderTop: `1.5px solid ${G.slateF1}`,
          background: G.slateFa, display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          <button onClick={onCancel} style={{
            height: 38, padding: "0 18px", background: "white",
            border: `1.5px solid ${G.slateE}`, borderRadius: 9,
            fontSize: 13, fontWeight: 600, color: G.slate5, cursor: "pointer",
          }}>Цуцлах</button>
          <button onClick={onConfirm} style={{
            height: 38, padding: "0 20px",
            background: "linear-gradient(135deg,#EF4444,#DC2626)",
            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700,
            color: "white", cursor: "pointer",
            boxShadow: "0 3px 12px rgba(239,68,68,.35)",
          }}>Устгах</button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   BULK DELETE CONFIRM MODAL
═══════════════════════════════════════════════════════════ */
const BulkDeleteModal = ({ count, onConfirm, onCancel }) => (
  <div onClick={onCancel} style={{
    position: "fixed", inset: 0,
    background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1200, animation: "fadeO .2s ease",
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      background: "white", borderRadius: 18, width: "90%", maxWidth: 420,
      boxShadow: "0 28px 64px rgba(0,0,0,.28)", overflow: "hidden",
      animation: "slideM .26s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <div style={{
        padding: "18px 22px", borderBottom: `1.5px solid ${G.slateF1}`,
        background: G.slateFa, display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: "rgba(239,68,68,.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={G.red} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: G.slate0 }}>Олноор устгах</div>
          <div style={{ fontSize: 12, color: G.slate5, marginTop: 2 }}>Сонгосон мөрүүдийг бүрмөсөн устгана</div>
        </div>
      </div>
      <div style={{ padding: "18px 22px" }}>
        <div style={{
          background: "rgba(239,68,68,.05)", border: "1.5px solid rgba(239,68,68,.18)",
          borderRadius: 10, padding: "12px 16px", fontSize: 13, color: G.slate0,
        }}>
          <strong>{count}</strong> мөрийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
        </div>
      </div>
      <div style={{
        padding: "14px 22px", borderTop: `1.5px solid ${G.slateF1}`,
        background: G.slateFa, display: "flex", justifyContent: "flex-end", gap: 8,
      }}>
        <button onClick={onCancel} style={{
          height: 38, padding: "0 18px", background: "white",
          border: `1.5px solid ${G.slateE}`, borderRadius: 9,
          fontSize: 13, fontWeight: 600, color: G.slate5, cursor: "pointer",
        }}>Цуцлах</button>
        <button onClick={onConfirm} style={{
          height: 38, padding: "0 20px",
          background: "linear-gradient(135deg,#EF4444,#DC2626)",
          border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700,
          color: "white", cursor: "pointer",
          boxShadow: "0 3px 12px rgba(239,68,68,.35)",
        }}>Устгах</button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════ */
const Icon = ({ d, size = 14, color = "currentColor", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Icons = {
  Search:      () => <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />,
  X:           () => <Icon d="M18 6L6 18M6 6l12 12" />,
  ChevronL:    () => <Icon d="M15 18l-6-6 6-6" />,
  ChevronR:    () => <Icon d="M9 18l6-6-6-6" />,
  Download:    () => <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />,
  Trash2:      () => <Icon d={["M3 6h18","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6","M10 11v6","M14 11v6","M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"]} />,
  Edit2:       () => <Icon d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  Save:        () => <Icon d={["M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z","M17 21v-8H7v8","M7 3v5h8"]} />,
  Eye:         () => <Icon d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"]} />,
  Plus:        () => <Icon d="M12 5v14M5 12h14" strokeWidth={2.2} />,
  Filter:      () => <Icon d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />,
  Sliders:     () => <Icon d={["M4 21v-7","M4 10V3","M12 21v-9","M12 8V3","M20 21v-5","M20 12V3","M1 14h6","M9 8h6","M17 16h6"]} />,
  Rotate:      () => <Icon d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />,
  Tag:         () => <Icon d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />,
  CheckSq:     () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"
        stroke={G.accent1} strokeWidth="2" fill="rgba(225,118,27,.12)" />
      <polyline points="9 12 12 15 16 9" stroke={G.accent1} strokeWidth="2.2" />
    </svg>
  ),
  UncheckedSq: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke={G.slate8} strokeWidth="2" />
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════
   ACTION BUTTON
═══════════════════════════════════════════════════════════ */
const ActionBtn = ({ children, onClick, title, bg, border, color, hoverBg, hoverColor = "white" }) => {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: 8,
        border: `1.5px solid ${hover ? "transparent" : border}`,
        background: hover ? hoverBg : bg,
        color: hover ? hoverColor : color,
        cursor: "pointer",
        transform: hover ? "translateY(-1px)" : "none",
        boxShadow: hover ? "0 3px 10px rgba(0,0,0,.15)" : "none",
        transition: "all .17s ease", flexShrink: 0,
      }}
    >{children}</button>
  );
};

/* ═══════════════════════════════════════════════════════════
   PAGINATION BUTTON
═══════════════════════════════════════════════════════════ */
const PgBtn = ({ children, onClick, disabled, active }) => {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minWidth: 32, height: 32, padding: "0 8px",
        background: active ? gradBrand : "white",
        border: active ? "none" : `1.5px solid ${hover && !disabled ? G.accent1 : G.slateE}`,
        borderRadius: 8, fontSize: 13, fontWeight: 600,
        color: active ? "white" : hover && !disabled ? G.accent1 : G.slate5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? .35 : 1,
        boxShadow: active ? "0 3px 10px rgba(225,118,27,.3)" : "none",
        transition: "all .16s ease",
      }}
    >{children}</button>
  );
};

/* ═══════════════════════════════════════════════════════════
   UNIVERSAL TABLE

   ┌─── Permission resolution ────────────────────────────────┐
   │                                                           │
   │  permissionKey + enable* ХАМТДАА ажиллана (AND logic):   │
   │                                                           │
   │  permissionKey өгсөн үед:                                 │
   │    canEdit = permission['edit'] exists  AND  enableEdit !== false  │
   │    → permission байвал ч enableEdit={false} бол нуугдана  │
   │    → enable* prop өгөөгүй бол зөвхөн permission шийдэнэ  │
   │                                                           │
   │  permissionKey өгөөгүй үед:                               │
   │    → enable* props л ажиллана (хуучин behavior)           │
   │                                                           │
   │  Жишээ:                                                   │
   │    <UniversalTable                                        │
   │      permissionKey="bookscategories"                      │
   │      enableDelete={false}   ← permission байсан ч нуугдана│
   │    />                                                     │
   ├─── Edit mode ──────────────────────────────────────────┤
   │                                                           │
   │  editMode="inline"   (default)                            │
   │    → Мөрийн дотор inline засах (save/cancel товч гарна)  │
   │                                                           │
   │  editMode="navigate"                                      │
   │    → onEdit(item) шууд дуудна (navigate хийхэд тохиромжтой)│
   │    Жишээ: onEdit={item => navigate(`/books-edit/${item.id}`)}│
   │                                                           │
   └───────────────────────────────────────────────────────────┘
═══════════════════════════════════════════════════════════ */
const UniversalTable = ({
  data               = [],
  columns            = [],
  pageSize           = 10,
  title,
  addLabel           = "Нэмэх",

  // ── Permission (Option A: auth-based) ────────────────────
  permissionKey,          // e.g. "bookscategories" | "books"

  // ── enable* props — works in both modes ──────────────────
  // With permissionKey:    AND gate (false = force-hide even if user has perm)
  // Without permissionKey: sole controller (true = show, false/undefined = hide)
  enableAdd    = undefined,
  enableEdit   = undefined,
  enableDelete = undefined,
  enableView   = undefined,

  // ── Edit mode ─────────────────────────────────────────────
  // "inline"   (default) → edit directly in table row
  // "navigate" → calls onEdit(item) immediately (use for navigate to edit page)
  editMode = "inline",

  // ── Feature flags (not permission-gated) ─────────────────
  enableSearch       = true,
  enableSort         = true,
  enableExport       = true,
  enableRowSelection = false,
  enableBulkActions  = false,
  enableFilter       = false,

  searchFields   = [],
  filterFields   = [],

  onEdit, onDelete, onView, onAdd,
  onSelectionChange, onBulkDelete,
  customActions,
  rowClassName,
}) => {

  /* ── Resolve permissions (ONE source of truth) ── */
  const { canAdd, canEdit, canDelete, canView } = useResolvedPermissions({
    permissionKey,
    enableAdd,
    enableEdit,
    enableDelete,
    enableView,
  });

  /* ── State ── */
  const [searchTerm,    setSearchTerm]    = useState("");
  const [sortConfig,    setSortConfig]    = useState({ key: null, dir: "asc" });
  const [currentPage,   setCurrentPage]   = useState(1);
  const [editingId,     setEditingId]     = useState(null);
  const [editedData,    setEditedData]    = useState({});
  const [viewItem,      setViewItem]      = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [newItem,       setNewItem]       = useState({});
  const [selectedRows,  setSelectedRows]  = useState(new Set());
  const [selectAll,     setSelectAll]     = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters,   setShowFilters]   = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [showBulkDel,   setShowBulkDel]   = useState(false);

  /* ── Filter ── */
  const handleFilterChange = useCallback((key, val) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (!val) delete next[key]; else next[key] = val;
      return next;
    });
    setCurrentPage(1);
  }, []);
  const resetFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  /* ── Pipeline ── */
  const afterFilter = useMemo(() => {
    if (!Object.keys(activeFilters).length) return data;
    return data.filter(item =>
      Object.entries(activeFilters).every(([k, v]) => {
        const fd = filterFields.find(f => f.key === k);
        if (fd?.filterFn) return fd.filterFn(item, v);
        return String(getVal(item, k)) === String(v);
      })
    );
  }, [data, activeFilters, filterFields]);

  const afterSearch = useMemo(() => {
    if (!searchTerm.trim()) return afterFilter;
    const q = searchTerm.toLowerCase();
    return afterFilter.filter(item => {
      const fields = searchFields.length ? searchFields : columns.map(c => c.key);
      return fields.some(f => getVal(item, f)?.toString().toLowerCase().includes(q));
    });
  }, [afterFilter, searchTerm, searchFields, columns]);

  const sorted = useMemo(() => {
    if (!sortConfig.key) return afterSearch;
    return [...afterSearch].sort((a, b) => {
      const av = getVal(a, sortConfig.key);
      const bv = getVal(b, sortConfig.key);
      if (av < bv) return sortConfig.dir === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [afterSearch, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = useMemo(() => {
    const s = (currentPage - 1) * pageSize;
    return sorted.slice(s, s + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = key => {
    if (!enableSort) return;
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  const toggleRow = id => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
    onSelectionChange?.(Array.from(next));
  };
  const toggleAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = new Set(paged.map(r => r.id));
      setSelectedRows(ids);
      onSelectionChange?.(Array.from(ids));
    }
    setSelectAll(v => !v);
  };

  const startEdit  = item => {
    if (editMode === "navigate") { onEdit?.(item); return; }
    setEditingId(item.id); setEditedData({ ...item });
  };
  const saveEdit   = ()   => { onEdit?.(editedData); setEditingId(null); setEditedData({}); };
  const cancelEdit = ()   => { setEditingId(null); setEditedData({}); };

  const openAdd   = () => {
    const init = {};
    columns.forEach(c => { if (c.key !== "id") init[c.key] = ""; });
    setNewItem(init);
    setShowAddModal(true);
  };
  const submitAdd = () => { onAdd?.(newItem); setShowAddModal(false); setNewItem({}); };

  const requestDelete     = item => setDeleteTarget(item);
  const confirmDelete     = ()   => { onDelete?.(deleteTarget.id); setDeleteTarget(null); };
  const requestBulkDelete = ()   => { if (selectedRows.size) setShowBulkDel(true); };
  const confirmBulkDelete = ()   => {
    onBulkDelete?.(Array.from(selectedRows));
    setSelectedRows(new Set());
    setSelectAll(false);
    setShowBulkDel(false);
  };

  const exportCSV = () => {
    const head = columns.map(c => c.label).join(",");
    const rows = sorted.map(item => columns.map(c => `"${getVal(item, c.key) ?? ""}"`).join(","));
    const blob = new Blob([[head, ...rows].join("\n")], { type: "text/csv" });
    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: `export_${Date.now()}.csv`,
    }).click();
  };

  const displayVal = (item, col) => {
    const v = getVal(item, col.key);
    if (col.render) return col.render(item, v);
    if (v == null) return <span style={{ color: G.slate8 }}>—</span>;
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  };

  const activeFilterCount = Object.keys(activeFilters).length;
  const hasActions = canEdit || canDelete || canView || customActions;

  const pageRange = useMemo(() => {
    const range = [], delta = 2;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentPage - delta && p <= currentPage + delta))
        range.push(p);
      else if (range[range.length - 1] !== "…")
        range.push("…");
    }
    return range;
  }, [totalPages, currentPage]);

  const kf = `
    @keyframes fadeO { from{opacity:0} to{opacity:1} }
    @keyframes slideM {
      from{opacity:0;transform:scale(.96) translateY(12px)}
      to  {opacity:1;transform:scale(1)   translateY(0)}
    }
    @keyframes slideFP {
      from{opacity:0;transform:translateY(-6px)}
      to  {opacity:1;transform:translateY(0)}
    }
  `;

  /* ════════════════════════════════════════════ RENDER ════ */
  return (
    <>
      <style>{kf}</style>

      {deleteTarget && (
        <DeleteModal item={deleteTarget} columns={columns}
          onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}
      {showBulkDel && (
        <BulkDeleteModal count={selectedRows.size}
          onConfirm={confirmBulkDelete} onCancel={() => setShowBulkDel(false)} />
      )}

      {/* View Modal */}
      {viewItem && (
        <div onClick={() => setViewItem(null)} style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.55)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1100, animation: "fadeO .2s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: 18, width: "90%", maxWidth: 560,
            maxHeight: "88vh", display: "flex", flexDirection: "column",
            overflow: "hidden", boxShadow: "0 28px 64px rgba(0,0,0,.3)",
            animation: "slideM .26s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: `1.5px solid ${G.slateF1}`,
              background: G.slateFa, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 24, borderRadius: 3, background: gradBrand }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: G.slate0, margin: 0 }}>Дэлгэрэнгүй</h3>
              </div>
              <button onClick={() => setViewItem(null)} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, background: G.slateF8,
                border: `1.5px solid ${G.slateE}`, borderRadius: 8, color: G.slate5, cursor: "pointer",
              }}><Icons.X /></button>
            </div>
            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1 }}>
              {columns.map(col => (
                <div key={col.key} style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  padding: "12px 0", borderBottom: `1px solid ${G.slateF8}`,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: G.slate6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{col.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: G.slate0 }}>{displayVal(viewItem, col)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div onClick={() => setShowAddModal(false)} style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.55)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1100, animation: "fadeO .2s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: 18, width: "90%", maxWidth: 560,
            maxHeight: "88vh", display: "flex", flexDirection: "column",
            overflow: "hidden", boxShadow: "0 28px 64px rgba(0,0,0,.3)",
            animation: "slideM .26s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "18px 22px", borderBottom: `1.5px solid ${G.slateF1}`,
              background: G.slateFa, flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 24, borderRadius: 3, background: gradBrand }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: G.slate0, margin: 0 }}>Шинэ өгөгдөл нэмэх</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, background: G.slateF8,
                border: `1.5px solid ${G.slateE}`, borderRadius: 8, color: G.slate5, cursor: "pointer",
              }}><Icons.X /></button>
            </div>
            <div style={{ padding: "18px 22px", overflowY: "auto", flex: 1 }}>
              {columns.filter(c => c.editable !== false && c.key !== "id").map(col => (
                <div key={col.key} style={{ marginBottom: 14 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 700, color: G.slate5,
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6,
                  }}>{col.label}</label>
                  <input
                    value={newItem[col.key] || ""}
                    placeholder={`${col.label} оруулна уу`}
                    onChange={e => setNewItem({ ...newItem, [col.key]: e.target.value })}
                    style={{
                      width: "100%", height: 40, padding: "0 12px",
                      border: `1.5px solid ${G.slateE}`, borderRadius: 9,
                      fontSize: 13, color: G.slate0, outline: "none", boxSizing: "border-box",
                    }}
                    onFocus={e => { e.target.style.borderColor = G.accent1; e.target.style.boxShadow = "0 0 0 3px rgba(225,118,27,.1)"; }}
                    onBlur={e => { e.target.style.borderColor = G.slateE; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
            </div>
            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              padding: "14px 22px", borderTop: `1.5px solid ${G.slateF1}`,
              background: G.slateFa, flexShrink: 0,
            }}>
              <button onClick={() => setShowAddModal(false)} style={{
                height: 38, padding: "0 18px", background: "white",
                border: `1.5px solid ${G.slateE}`, borderRadius: 9,
                fontSize: 13, fontWeight: 600, color: G.slate5, cursor: "pointer",
              }}>Цуцлах</button>
              <button onClick={submitAdd} style={{
                display: "flex", alignItems: "center", gap: 6,
                height: 38, padding: "0 20px", background: gradBrand,
                border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700,
                color: "white", cursor: "pointer",
                boxShadow: "0 3px 12px rgba(225,118,27,.3)",
              }}><Icons.Save /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MAIN WRAP ════ */}
      <div style={{
        background: "white", border: `1.5px solid ${G.slateF1}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,.05)", position: "relative",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradBrand, opacity: .85 }} />

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12, padding: "16px 20px",
          background: G.slateFa, borderBottom: `1.5px solid ${G.slateF1}`, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, flexWrap: "wrap" }}>
            {title && (
              <h2 style={{
                fontSize: 15, fontWeight: 800, color: G.slate0,
                margin: 0, whiteSpace: "nowrap",
                paddingRight: 8, borderRight: `1.5px solid ${G.slateE}`,
              }}>{title}</h2>
            )}
            {enableSearch && (
              <div
                onFocusCapture={e => { e.currentTarget.style.borderColor = G.accent1; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(225,118,27,.1)"; }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = G.slateE; e.currentTarget.style.boxShadow = "none"; }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "0 13px", height: 38,
                  background: "white", border: `1.5px solid ${G.slateE}`, borderRadius: 10,
                  minWidth: 200, flex: 1, maxWidth: 300, transition: "all .18s",
                }}
              >
                <Icons.Search />
                <input
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: G.slate0, background: "transparent" }}
                  placeholder="Хайх..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} style={{
                    display: "flex", alignItems: "center",
                    background: "none", border: "none", cursor: "pointer", color: G.slate6, padding: 2,
                  }}><Icons.X /></button>
                )}
              </div>
            )}
            {enableFilter && filterFields.length > 0 && (
              <button onClick={() => setShowFilters(v => !v)} style={{
                display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 14px",
                background: showFilters || activeFilterCount ? "rgba(225,118,27,.05)" : "white",
                border: `1.5px solid ${showFilters || activeFilterCount ? G.accent1 : G.slateE}`,
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                color: showFilters || activeFilterCount ? G.accent1 : G.slate5,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
                <Icons.Sliders />
                <span>Шүүлтүүр</span>
                {activeFilterCount > 0 && (
                  <span style={{
                    minWidth: 17, height: 17, background: gradBrand, color: "white",
                    borderRadius: 9, fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
                  }}>{activeFilterCount}</span>
                )}
              </button>
            )}
            {enableBulkActions && selectedRows.size > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "6px 14px",
                background: "rgba(225,118,27,.08)", border: "1.5px solid rgba(225,118,27,.2)",
                borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#78350f",
              }}>
                <span>{selectedRows.size} сонгогдсон</span>
                {canDelete && (
                  <button onClick={requestBulkDelete} style={{
                    display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                    background: "rgba(239,68,68,.08)", border: "1.5px solid rgba(239,68,68,.25)",
                    borderRadius: 7, fontSize: 12, fontWeight: 700, color: G.red, cursor: "pointer",
                  }}><Icons.Trash2 /><span>Устгах</span></button>
                )}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {canAdd && (
              <button onClick={openAdd} style={{
                display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 16px",
                background: gradBrand, border: "none", borderRadius: 10, color: "white",
                fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                boxShadow: "0 3px 12px rgba(225,118,27,.3)",
              }}><Icons.Plus />{addLabel}</button>
            )}
            {enableExport && (
              <button onClick={exportCSV} title="CSV татах" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 38, height: 38, background: "white",
                border: `1.5px solid ${G.slateE}`, borderRadius: 10, color: G.slate5, cursor: "pointer",
              }}><Icons.Download /></button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {enableFilter && showFilters && filterFields.length > 0 && (
          <div style={{
            padding: "16px 20px", background: "white",
            borderBottom: "1.5px solid rgba(225,118,27,.15)",
            animation: "slideFP .22s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icons.Filter />
                <span style={{ fontWeight: 700, fontSize: 13, color: G.slate0 }}>Шүүлтүүр</span>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 12px",
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  borderRadius: 8, fontSize: 12, fontWeight: 600, color: G.red, cursor: "pointer",
                }}><Icons.Rotate /><span>Цэвэрлэх</span></button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
              {filterFields.map(f => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{
                    fontSize: 10, fontWeight: 700, color: G.slate6,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{f.label}</label>
                  <select
                    value={activeFilters[f.key] || ""}
                    onChange={e => handleFilterChange(f.key, e.target.value || null)}
                    style={{
                      height: 36, padding: "0 28px 0 10px",
                      border: `1.5px solid ${G.slateE}`, borderRadius: 8,
                      fontSize: 13, color: G.slate0, background: G.slateFa,
                      outline: "none", cursor: "pointer", appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                    }}
                  >
                    <option value="">— Бүгд —</option>
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 6,
                marginTop: 10, paddingTop: 10, borderTop: `1.5px solid ${G.slateF8}`,
              }}>
                {Object.entries(activeFilters).map(([k, v]) => {
                  const fd = filterFields.find(f => f.key === k);
                  const opt = fd?.options?.find(o => String(o.value) === String(v));
                  return (
                    <span key={k} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
                      background: "rgba(225,118,27,.08)", border: "1px solid rgba(225,118,27,.2)",
                      borderRadius: 20, fontSize: 11, fontWeight: 600, color: "#78350f",
                    }}>
                      <Icons.Tag />{fd?.label}: {opt?.label || v}
                      <button onClick={() => handleFilterChange(k, null)} style={{
                        display: "flex", alignItems: "center",
                        background: "none", border: "none", cursor: "pointer",
                        color: G.accent1, padding: 1, marginLeft: 2,
                      }}><Icons.X /></button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Count row */}
        <div style={{ padding: "8px 20px", background: G.slateFa, borderBottom: `1.5px solid ${G.slateF1}` }}>
          <span style={{ fontSize: 12, color: G.slate6, fontWeight: 500 }}>
            Нийт <strong style={{ color: G.slate0 }}>{sorted.length}</strong> бичлэг
            {(searchTerm || activeFilterCount) ? ` (${data.length}-с шүүгдсэн)` : ""}
          </span>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              {enableRowSelection && <col style={{ width: 48, minWidth: 48, maxWidth: 48 }} />}
              {columns.map(col => <col key={col.key} style={col.width ? { width: col.width } : {}} />)}
              {hasActions && <col style={{ width: 140 }} />}
            </colgroup>
            <thead>
              <tr>
                {enableRowSelection && (
                  <th style={{
                    width: 48, minWidth: 48, maxWidth: 48, padding: 0,
                    textAlign: "center", verticalAlign: "middle",
                    background: G.slateFa, borderBottom: `1.5px solid ${G.slateF1}`,
                  }}>
                    <button onClick={toggleAll} style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: "none", border: "none", cursor: "pointer", padding: 0, margin: 0, width: 24, height: 24,
                    }}>
                      {selectAll ? <Icons.CheckSq /> : <Icons.UncheckedSq />}
                    </button>
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th key={col.key} onClick={() => handleSort(col.key)} style={{
                    padding: "11px 14px",
                    paddingLeft: !enableRowSelection && idx === 0 ? 20 : 14,
                    textAlign: "left", fontSize: 10, fontWeight: 700, color: G.slate6,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    background: G.slateFa, borderBottom: `1.5px solid ${G.slateF1}`,
                    whiteSpace: "nowrap", userSelect: "none", overflow: "hidden", textOverflow: "ellipsis",
                    cursor: enableSort ? "pointer" : "default",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span>{col.label}</span>
                      {enableSort && sortConfig.key === col.key && (
                        sortConfig.dir === "asc"
                          ? <Icon d="M18 15l-6-6-6 6" size={13} color={G.accent1} />
                          : <Icon d="M6 9l6 6 6-6" size={13} color={G.accent1} />
                      )}
                    </div>
                  </th>
                ))}
                {hasActions && (
                  <th style={{
                    padding: "11px 20px 11px 8px", textAlign: "right",
                    fontSize: 10, fontWeight: 700, color: G.slate6,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    background: G.slateFa, borderBottom: `1.5px solid ${G.slateF1}`, whiteSpace: "nowrap",
                  }}>Үйлдэл</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (enableRowSelection ? 1 : 0) + (hasActions ? 1 : 0)}
                    style={{ textAlign: "center", padding: 0 }}>
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 8, padding: "3.5rem 1rem",
                    }}>
                      <Icon d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                        size={32} color={G.slate8} strokeWidth={1.2} />
                      <p style={{ fontSize: 14, fontWeight: 600, color: G.slate6, margin: 0 }}>Өгөгдөл олдсонгүй</p>
                      {(searchTerm || activeFilterCount > 0) && (
                        <button onClick={resetFilters} style={{
                          display: "flex", alignItems: "center", gap: 5, padding: "7px 16px",
                          background: "white", border: `1.5px solid ${G.slateE}`, borderRadius: 8,
                          fontSize: 12, fontWeight: 600, color: G.slate5, cursor: "pointer", marginTop: 4,
                        }}><Icons.Rotate /><span>Шүүлт цэвэрлэх</span></button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map(item => {
                  const isSelected = selectedRows.has(item.id);
                  const isEditing  = editingId === item.id;
                  return (
                    <tr key={item.id} className={rowClassName?.(item)}
                      style={{ background: isSelected ? "rgba(225,118,27,.06)" : "transparent", transition: "background .14s" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(225,118,27,.03)"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      {enableRowSelection && (
                        <td style={{
                          width: 48, minWidth: 48, maxWidth: 48, padding: 0,
                          textAlign: "center", verticalAlign: "middle",
                          borderBottom: `1px solid ${G.slateF8}`,
                          borderLeft: isSelected ? `3px solid ${G.accent1}` : "3px solid transparent",
                          transition: "border-color .2s",
                        }}>
                          <button onClick={() => toggleRow(item.id)} style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            background: "none", border: "none", cursor: "pointer", padding: 0, margin: 0, width: 24, height: 24,
                          }}>
                            {isSelected ? <Icons.CheckSq /> : <Icons.UncheckedSq />}
                          </button>
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td key={col.key} style={{
                          padding: "11px 14px",
                          paddingLeft: !enableRowSelection && colIdx === 0 ? 20 : 14,
                          fontSize: 13, color: G.slate0, fontWeight: 500,
                          verticalAlign: "middle", overflow: "hidden",
                          borderBottom: `1px solid ${G.slateF8}`,
                        }}>
                          {isEditing && col.editable !== false ? (
                            <input
                              value={editedData[col.key] ?? ""}
                              onChange={e => setEditedData({ ...editedData, [col.key]: e.target.value })}
                              style={{
                                width: "100%", height: 34, padding: "0 10px",
                                border: "1.5px solid rgba(225,118,27,.4)", borderRadius: 7,
                                fontSize: 13, color: G.slate0, background: "white",
                                outline: "none", boxSizing: "border-box",
                              }}
                              onFocus={e => { e.target.style.borderColor = G.accent1; e.target.style.boxShadow = "0 0 0 3px rgba(225,118,27,.1)"; }}
                              onBlur={e => { e.target.style.borderColor = "rgba(225,118,27,.4)"; e.target.style.boxShadow = "none"; }}
                            />
                          ) : (
                            displayVal(item, col)
                          )}
                        </td>
                      ))}
                      {hasActions && (
                        <td style={{
                          padding: "11px 20px 11px 8px", textAlign: "right",
                          verticalAlign: "middle", whiteSpace: "nowrap",
                          borderBottom: `1px solid ${G.slateF8}`,
                        }}>
                          {isEditing ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <ActionBtn onClick={saveEdit} title="Хадгалах"
                                bg="rgba(16,185,129,.08)" border="rgba(16,185,129,.28)"
                                color="#10B981" hoverBg="#10B981"><Icons.Save /></ActionBtn>
                              <ActionBtn onClick={cancelEdit} title="Цуцлах"
                                bg={G.slateF8} border={G.slateE} color={G.slate6}
                                hoverBg="#FEF2F2" hoverColor={G.red}><Icons.X /></ActionBtn>
                            </div>
                          ) : (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              {canView && (
                                <ActionBtn onClick={() => { setViewItem(item); onView?.(item); }} title="Харах"
                                  bg="rgba(225,118,27,.07)" border="rgba(225,118,27,.3)"
                                  color={G.accent1} hoverBg={gradBrand}><Icons.Eye /></ActionBtn>
                              )}
                              {canEdit && (
                                <ActionBtn onClick={() => startEdit(item)} title="Засах"
                                  bg={G.slateF8} border={G.slateE} color={G.slate5}
                                  hoverBg={G.slate0} hoverColor="white"><Icons.Edit2 /></ActionBtn>
                              )}
                              {canDelete && (
                                <ActionBtn onClick={() => requestDelete(item)} title="Устгах"
                                  bg="rgba(239,68,68,.06)" border="rgba(239,68,68,.22)"
                                  color={G.red} hoverBg={G.red}><Icons.Trash2 /></ActionBtn>
                              )}
                              {customActions?.(item)}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 5, padding: "14px 20px",
            background: G.slateFa, borderTop: `1.5px solid ${G.slateF1}`, flexWrap: "wrap",
          }}>
            <PgBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <Icons.ChevronL />
            </PgBtn>
            {pageRange.map((p, i) =>
              p === "…"
                ? <span key={`e${i}`} style={{ fontSize: 13, color: G.slate8, padding: "0 4px" }}>…</span>
                : <PgBtn key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>{p}</PgBtn>
            )}
            <PgBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <Icons.ChevronR />
            </PgBtn>
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 500, color: G.slate6 }}>
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} / {sorted.length}
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default UniversalTable;