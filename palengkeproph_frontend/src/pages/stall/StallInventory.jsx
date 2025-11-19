// src/pages/stall/StallInventory.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Divider,
  SwipeableDrawer,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Map as MapIcon,
  TableRows as TableRowsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import Legend from "../../layouts/Legend";
import MainLayout from "../../layouts/MainLayout";

// STATUS COLORS (theme)
const STATUS_COLORS = {
  Available: "#4CAF50",
  Occupied: "#1976D2",
  Reserved: "#FFB300",
  "Under Maintenance": "#E64A19",
  Inactive: "#9E9E9E",
};

// generate new id
function newStallId(stalls) {
  return `ST-${String(stalls.length + 1).padStart(3, "0")}`;
}

export default function StallInventory() {
  const [view, setView] = useState("table"); // 'table' | 'map'
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStall, setSelectedStall] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drawer (bottom) state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // sample stalls with schematic placement
  const [stalls, setStalls] = useState(() => [
    { id: "C-01", original_owner: "Charles", type: "Tank", classification: "Center", location: "Water Tank", dimensions: "6x6m", capacity: 1, status: "Occupied", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 68, y: 2, w: 8, h: 8 },
    { id: "D-83", original_owner: "Brian", type: "Stall", classification: "Center", location: "Stall", dimensions: "6x6m", capacity: 1, status: "Available", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 74, y: 4, w: 3, h: 4 },
    { id: "C-01", original_owner: "Mitra", type: "Admin", classification: "Center", location: "ADMIN", dimensions: "6x6m", capacity: 1, status: "Occupied", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 68, y: 31, w: 10, h: 14 },
    { id: "C-01", original_owner: "Charles", type: "CR", classification: "Center", location: "CR", dimensions: "6x6m", capacity: 1, status: "Occupied", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 64, y: 95, w: 10, h: 14 },
    { id: "D-53", original_owner: "Charles", type: "Stall", classification: "Center", location: "Stall", dimensions: "6x6m", capacity: 1, status: "Under Maintenance", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 59, y: 95, w: 5, h: 7 },
    { id: "D-54", original_owner: "Charles", type: "Stall", classification: "Center", location: "Stall", dimensions: "6x6m", capacity: 1, status: "Inactive", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 59, y: 102, w: 5, h: 7 },
    { id: "D-64", original_owner: "Charles", type: "Stall", classification: "Center", location: "Stall", dimensions: "6x6m", capacity: 1, status: "Inactive", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 67, y: 109, w: 7, h: 7 },
    { id: "D-55", original_owner: "Charles", type: "Stall", classification: "Center", location: "Stall", dimensions: "6x6m", capacity: 1, status: "Inactive", leaseId: "ADMIN-01", dateAdded: "2025-01-01", lastUpdated: "2025-01-08", x: 59, y: 109, w: 8, h: 7 },



      ...Array.from({ length: 90 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Left Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Reserved" : "Under Maintenance",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: -5 + (i % 18) * 3.2,             // 0 or 1 column
      y: -15 + Math.floor(i / 18) * 10,     // 4 rows (0..3)
      w: 3,
      h: 4,
    })),
    ...Array.from({ length: 90 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Left Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Inactive",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: -5 + (i % 18) * 3.2,             // 0 or 1 column
      y: 45 + Math.floor(i / 18) * 10,     // 4 rows (0..3)

      w: 3,
      h: 4,
    })),

      ...Array.from({ length: 18 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Center Left Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 55 + (i % 2) * 5,             // 0 or 1 column
      y: -13 + Math.floor(i / 2) * 5.5,     // 4 rows (0..3)
      
      w: 4,
      h: 5,
    })),

      ...Array.from({ length: 18 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Center Left Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 55 + (i % 2) * 5,             // 0 or 1 column
      y: 40 + Math.floor(i / 2) * 5.5,     // 4 rows (0..3)
      
      w: 4,
      h: 5,
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Right Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 80 + (i % 2) * 6.7,             // 0 or 1 column
      y: -13 + Math.floor(i / 2) * 16,       
      
      w: 6,
      h: 15,
    })),

        ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Right Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 97 + (i % 2) * 6.7,             // 0 or 1 column
      y: -13 + Math.floor(i / 2) * 16,       

      w: 6,
      h: 15,
    })),


      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Right Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 114 + (i % 2) * 6.7,             // 0 or 1 column
      y: -13 + Math.floor(i / 2) * 16,     // 4 rows (0..3)
      
      w: 6,
      h: 15,

    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Right Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 114 + (i % 2) * 6.7,             // 0 or 1 column
      y: 40 + Math.floor(i / 2) * 16,     // 4 rows (0..3)
      
      w: 6,
      h: 15,
    })),


      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Right Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Reserved",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 97 + (i % 2) * 6.7,             // 0 or 1 column
      y: 40 + Math.floor(i / 2) * 16,     // 4 rows (0..3)

      w: 6,
      h: 15,
    })),

      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Right Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 80 + (i % 2) * 6.7,             // 0 or 1 column
      y: 40 + Math.floor(i / 2) * 16,     // 4 rows (0..3)
      
      w: 6,
      h: 15,
    })),

      ...Array.from({ length: 12 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Under Admin Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 68 + (i % 2) * 5.5,             // 0 or 1 column
      y: 46  + Math.floor(i / 2) * 6.5,     // 4 rows (0..3)
      
      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Upper Admin Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Reserved",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 68 + (i % 2) * 5.5,             // 0 or 1 column
      y: 11  + Math.floor(i / 2) * 6.5,     // 4 rows (0..3)
      
      w: 5,
      h: 6,
    })),

    ...Array.from({ length: 2 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Above Admin Block",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 68 + (i % 2) * 5.5,             // 0 or 1 column
      y: -5  + Math.floor(i / 2) * 5.5,     // 4 rows (0..3)
      
      w: 5,
      h: 6,
    })),


      ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      type: "Food",
      classification: "Under the Map",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 8 + (i % 4) * 5.5,             // 0 or 1 column
      y: 100  + Math.floor(i / 4) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Under the Map",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 32 + (i % 4) * 5.5,             // 0 or 1 column
      y: 100  + Math.floor(i / 4) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Under the Map",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 82 + (i % 4) * 5.5,             // 0 or 1 column
      y: 100  + Math.floor(i / 4) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Under the Map",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Available",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: 106 + (i % 4) * 5.5,             // 0 or 1 column
      y: 100  + Math.floor(i / 4) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Ambulant Blocks",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x:  -41.5 + (i % 3) * 5.5,             // 0 or 1 column
      y: -10  + Math.floor(i / 3) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Ambulant Blocks",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: -41.5+ (i % 3) * 5.5,             // 0 or 1 column
      y: 5  + Math.floor(i / 3) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Ambulant Blocks",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x:  -41.5 + (i % 3) * 5.5,             // 0 or 1 column
      y: 20  + Math.floor(i / 3) * 6.5,     // 4 rows (0..3)

      w: 5,
      h: 6,
    })),

      ...Array.from({ length: 12 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      classification: "Ambulant Blocks",
      location: `B${i + 1}`,
      dimensions: "2x3m",
      capacity: 1,
      status: i % 4 === 0 ? "Under Maintenance" : "Occupied",
      leaseId: "",
      dateAdded: "2025-02-10",
      lastUpdated: "2025-02-10",

      // 2 columns
      x: -42 + (i % 2) * 8.5,             // 0 or 1 column
      y: 40  + Math.floor(i / 2) * 8.5,     // 4 rows (0..3)

      w: 8,
      h: 8,
    })),


    
  ]);
  

  // form state for Add/Edit modal
  const [form, setForm] = useState({
    id: "",
    type: "",
    classification: "",
    location: "",
    dimensions: "",
    capacity: 1,
    status: "Available",
    leaseId: "",
    x: 10,
    y: 10,
    w: 4,
    h: 8, 
  });

  const statuses = ["Available", "Occupied", "Reserved", "Under Maintenance", "Inactive"];

  // filtered stalls (search)
  const filtered = useMemo(() => {
    if (!search.trim()) return stalls;
    const q = search.toLowerCase();
    return stalls.filter((s) => Object.values(s).join(" ").toLowerCase().includes(q));
  }, [search, stalls]);

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // open add modal
  const handleAddNew = () => {
    setForm({
      id: "",
      type: "",
      classification: "",
      location: "",
      dimensions: "",
      capacity: 1,
      status: "Available",
      leaseId: "",
      x: 20,
      y: 20,
      w: 6,
      h: 6,
    });
    setEditMode(false);
    setOpenModal(true);
  };

  // open edit modal
  const handleEdit = (stall) => {
    setForm({ ...stall });
    setEditMode(true);
    setOpenModal(true);
  };

  const handleSave = () => {
    if (!form.type || !form.location) {
      alert("Type and Location are required.");
      return;
    }

    if (editMode) {
      setStalls((prev) => prev.map((s) => (s.id === form.id ? { ...form, lastUpdated: new Date().toISOString() } : s)));
    } else {
      const id = newStallId(stalls);
      setStalls((prev) => [
        ...prev,
        { ...form, id, dateAdded: new Date().toISOString(), lastUpdated: new Date().toISOString() },
      ]);
    }
    setOpenModal(false);
    setEditMode(false);
  };

  const handleDelete = (stallId) => {
    setDeleteConfirm(stallId);
  };

  const confirmDelete = () => {
    setStalls((prev) => prev.map((s) => (s.id === deleteConfirm ? { ...s, status: "Inactive" } : s)));
    setDeleteConfirm(null);
  };

  // when user clicks a stall (table or map) open the bottom drawer with details
  const handleOpenDrawer = (stall) => {
    setSelectedStall(stall);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // keep selectedStall if you want, but we clear for clarity:
    setTimeout(() => setSelectedStall(null), 200);
  };

  // quick map click -> open drawer (and allow edit from there)
  const handleMapClick = (stall) => {
    handleOpenDrawer(stall);
  };

  /*** ===== Pan + Zoom Map State & Handlers (Option B + Drag 2) ===== ***/
  const mapRef = useRef(null);

  // scale and offset (in px)
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // dragging state
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 }); // start pointer relative to offset
  const draggingRef = useRef(false); // for event listeners
  const minScale = 0.4;
  const maxScale = 4;

  // When in map view and Option B active -> disable page scroll
  useEffect(() => {
    if (view === "map") {
      // disable page scroll while map view active (Option B)
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    // no cleanup needed when not map
    return;
  }, [view]);

  // helper: clamp
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // wheel — zoom towards pointer
  const handleWheel = (e) => {
    // Option B: dedicated wheel to map (we already disabled page scroll when view === 'map')
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.08 : 0.08; // zoom step
    const newScaleUnclamped = scale + delta;
    const newScale = clamp(newScaleUnclamped, minScale, maxScale);
    if (!mapRef.current) {
      setScale(newScale);
      return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // adjust offset so the point under the cursor remains under the cursor after scale
    const scaleFactor = newScale / scale;
    const newOffsetX = offset.x - (mouseX) * (scaleFactor - 1);
    const newOffsetY = offset.y - (mouseY) * (scaleFactor - 1);

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // pointer down -> start dragging
  const handlePointerDown = (e) => {
    // only left button
    if (e.button !== undefined && e.button !== 0) return;
    setDragging(true);
    draggingRef.current = true;
    // store pointer start relative to current offset
    startRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };

    // add global listeners (Option 2: continue drag until mouseup anywhere)
    window.addEventListener("mousemove", handleWindowPointerMove);
    window.addEventListener("mouseup", handleWindowPointerUp);
    // also support pointercancel / blur
    window.addEventListener("mouseleave", handleWindowPointerUp);
  };

  const handleWindowPointerMove = (e) => {
    if (!draggingRef.current) return;
    const nx = e.clientX - startRef.current.x;
    const ny = e.clientY - startRef.current.y;
    setOffset({ x: nx, y: ny });
  };

  const handleWindowPointerUp = (e) => {
    draggingRef.current = false;
    setDragging(false);
    // cleanup listeners
    window.removeEventListener("mousemove", handleWindowPointerMove);
    window.removeEventListener("mouseup", handleWindowPointerUp);
    window.removeEventListener("mouseleave", handleWindowPointerUp);
  };

  // cleanup on unmount just in case
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleWindowPointerMove);
      window.removeEventListener("mouseup", handleWindowPointerUp);
      window.removeEventListener("mouseleave", handleWindowPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // optional: keyboard + buttons for zoom in/out & center
  const zoomIn = () => setScale((s) => clamp(s + 0.2, minScale, maxScale));
  const zoomOut = () => setScale((s) => clamp(s - 0.2, minScale, maxScale));
  const centerMap = () => setOffset({ x: 0, y: 0 });

  /*** ===== End Pan + Zoom map logic ===== ***/

  return (
    <MainLayout>
    <Box sx={{ height:"calc(100vh - 140px)", overflowY:"auto" }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: "flex", alignItems: "center", gap: 0.5, "&:hover": { color: "#D32F2F" } }}>
            <HomeIcon fontSize="small" /> Dashboard
          </Link>
          <Link underline="hover" color="inherit" href="#" sx={{ "&:hover": { color: "#D32F2F" } }}>
            Stall Management
          </Link>
          <Typography color="text.primary">Stall Inventory</Typography>
        </Breadcrumbs>

        {/* Header + toolbar */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="black">Stall Inventory</Typography>
            <Typography color="text.secondary">Manage stalls with a table view and a schematic visual layout.</Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button startIcon={<AddIcon />} variant="contained" onClick={handleAddNew} sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}>
              Add New Stall
            </Button>

            <TextField
              size="small"
              placeholder="Search stalls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: "#888" }} /> }}
            />

            <ToggleButtonGroup value={view} exclusive onChange={(e, v) => v && setView(v)} size="small" sx={{ ml: 1 }}>
              <ToggleButton value="table" aria-label="table view"><TableRowsIcon /> Table</ToggleButton>
              <ToggleButton value="map" aria-label="map view"><MapIcon /> Map</ToggleButton>
            </ToggleButtonGroup>

            {/* Fullscreen Button */}
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              <IconButton onClick={toggleFullscreen} color="primary">
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table View */}
        {view === "table" && (
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><b>Stall ID</b></TableCell>
                  <TableCell><b>Original Owner</b></TableCell>
                  <TableCell><b>Type</b></TableCell>
                  <TableCell><b>Classification</b></TableCell>
                  <TableCell><b>Location</b></TableCell>
                  <TableCell><b>Dimensions</b></TableCell>
                  <TableCell><b>Capacity</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Last Updated</b></TableCell>
                  <TableCell align="center"><b>Actions</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((stall) => (
                  <TableRow key={stall.id} hover>
                    <TableCell>
                      <Button onClick={() => handleOpenDrawer(stall)} sx={{ textTransform: "none" }}>
                        {stall.id}
                      </Button>
                    </TableCell>
                    <TableCell>{stall.original_owner}</TableCell>
                    <TableCell>{stall.type}</TableCell>
                    <TableCell>{stall.classification}</TableCell>
                    <TableCell>{stall.location}</TableCell>
                    <TableCell>{stall.dimensions}</TableCell>
                    <TableCell>{stall.capacity}</TableCell>
                    <TableCell>
                      <Chip label={stall.status} sx={{ bgcolor: STATUS_COLORS[stall.status], color: "#fff", fontWeight: 600 }} size="small" />
                    </TableCell>
                    <TableCell>{stall.lastUpdated ? new Date(stall.lastUpdated).toLocaleDateString() : "-"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit"><IconButton onClick={() => handleEdit(stall)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton color="error" onClick={() => handleDelete(stall.id)}><DeleteIcon /></IconButton></Tooltip>
                      <Tooltip title="Quick View"><IconButton onClick={() => handleOpenDrawer(stall)}><MapIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No stalls found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Map View (REPLACED with pan/zoom + scroll wrapper + sticky controls) */}
        {view === "map" && (
          <Paper sx={{ borderRadius: 3, p: 2, position: "relative", overflow: "hidden" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Visual Market Layout (Schematic)</Typography>
            <Legend />
            {/* OUTER SCROLL WRAPPER — provides a scrollbar inside the map area even when page scroll is disabled */}
            <Box
              sx={{
                height: "calc(100vh - 260px)", // adjust this to match header/breadcrumbs height. 260px is conservative.
                position: "relative",
                pb: 8, // leave space for sticky controls
              }}
            >
              {/* Interactive map surface: aspect ratio container */}
              <Box
                ref={mapRef}
                sx={{
                  width: "100%",
                  position: "relative",
                  pt: "56%", // aspect ratio
                  bgcolor: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: dragging ? "grabbing" : "grab",
                  userSelect: "none",
                  touchAction: "none",
                }}
                onWheel={handleWheel}
                onMouseDown={handlePointerDown}
              >
                {/* Inner layer where everything is transformed (pan + zoom) */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: "top left",
                    transition: dragging ? "none" : "transform 80ms linear",
                  }}
                >

                  <Box sx={{ position: "absolute", left: "-45%", top: "-20%", width: "24%", height: "114%", border: "5px dashed #757575ff", borderRadius: 1, px: 1, py: 1, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 1 }}>

                  </Box>

                  {/* Static schematic regions */}
                  <Box sx={{ position: "absolute", top: "-20%", left: "-25%", width: "15%", height: "114%", border: "5px dashed #757575ff", borderRadius: 1, px: 1, py: 1, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>A</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>M</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>B</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>U</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>L</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>A</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>N</Typography>
                    <Typography sx={{ fontSize: 40, color: "text.secondary", fontWeight: "bold" }}>T</Typography>
                  </Box>


                  <Box sx={{ position: "absolute", left: "-25%", top: "-20%", width: "84%", height: "114%", border: "5px dashed #757575ff", borderRadius: 1, px: 1, py: 1, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography sx={{ fontSize: 150, color: "text.secondary", fontWeight: "bold" }}>W E T</Typography>
                    <Typography sx={{ fontSize: 120, color: "text.secondary", fontWeight: "bold" }}>S E C T I O N</Typography>
                  </Box>

                  <Box sx={{ position: "absolute", left: "64%", top: "4%", width: "18%", height: "66%", bgcolor: "#fafafa", border: "5px solid #757575ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 12, textAlign: "center" }}>Market Admin Office</Typography>
                  </Box>

                  <Box sx={{ position: "absolute", left: "72%", top: "-20%", width: "70%", height: "114%", border: "5px dashed #757575ff", borderRadius: 1, px: 1, py: 1, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 1  }}>
                    <Typography sx={{ fontSize: 150, color: "text.secondary", fontWeight: "bold" }}>D R Y</Typography>
                    <Typography sx={{ fontSize: 120, color: "text.secondary", fontWeight: "bold" }}>S E C T I O N</Typography>
                  </Box>

                  <Box sx={{ position: "absolute", left: "-10%", top: "104%", width: "152%", height: "24%", border: "5px dashed #757575ff", borderRadius: 1, px: 1, py: 1, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 1  }}>
                    <Typography sx={{ fontSize: 80, color: "text.secondary", fontWeight: "bold" }}>GENERAL TRIAS PUBLIC MARKET STALL</Typography>

                  </Box>

                  


                  {/* Render stalls scaled/translated */}
                  {stalls.map((s) => {
                    const matchSearch = search.trim() ? filtered.some((fs) => fs.id === s.id) : true;
                    return (
                      <Tooltip key={s.id} title={`${s.id} — ${s.status}`}>
                        <Box
                          onClick={() => handleMapClick(s)}
                          sx={{
                            position: "absolute",
                            left: `${s.x}%`,
                            top: `${s.y}%`,
                            width: `${s.w}%`,
                            height: `${s.h}%`,
                            bgcolor: STATUS_COLORS[s.status] || "#777",
                            color: "#fff",
                            borderRadius: 0.8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            cursor: "pointer",
                            boxShadow: 1,
                            opacity: matchSearch ? 1 : 0.25,
                            border: s.status === "Inactive" ? "2px dashed rgba(0,0,0,0.12)" : "none",
                            "&:hover": { transform: "scale(1.03)", zIndex: 10 },
                            transition: "all 120ms ease",
                          }}
                        >
                          <Box sx={{ textAlign: "center", px: 0.5 }}>
                            <Typography sx={{ fontSize: 10, fontWeight: 700 }}>{s.id}</Typography>
                            <Typography sx={{ fontSize: 10 }}>{s.location}</Typography>
                          </Box>
                        </Box>
                      </Tooltip>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* STICKY CONTROLS — pinned at bottom of the Paper (Buttons: B) */}
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                gap: 1,
                alignItems: "center",
                py: 1,
                px: 2,
                borderTop: "1px solid rgba(0,0,0,0.06)",
                bgcolor: "background.paper",
                zIndex: 40,
              }}
            >
              <Button variant="outlined" size="small" onClick={() => {
                // quick export: convert inner transformed area to PNG — placeholder for now
                // (You can implement html2canvas or svg export later)
                alert("Export to PNG: placeholder (implement with html2canvas).");
              }}>Export Map (PNG)</Button>

              <Button variant="outlined" size="small" onClick={centerMap}>Center</Button>

              <Button variant="outlined" size="small" onClick={zoomIn}>Zoom In</Button>
              <Button variant="outlined" size="small" onClick={zoomOut}>Zoom Out</Button>

              {/* Fullscreen button in map controls */}
              <Button 
                variant="outlined" 
                size="small" 
                onClick={toggleFullscreen}
                startIcon={isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>

              <Typography color="text.secondary" sx={{ ml: "auto" }}>Click a stall to quick-view details</Typography>
            </Box>
          </Paper>
        )}

        /* Add / Edit Modal */
          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: "#D32F2F", color: "#fff" }}>{editMode ? "Edit Stall Details" : "Add New Stall"}</DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Stall Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {["Fish", "Meat", "Parking", "Fixed Stall", "Food Stall", "Terminal", "Gutter", "Bazaar", "Vegetable", "RTW"].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
                </Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Classification" value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Location Label" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} /></Grid>
                <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Grid>
                <Grid item xs={6} sm={3}>
            <TextField fullWidth select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
                </Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Lease ID (optional)" value={form.leaseId} onChange={(e) => setForm({ ...form, leaseId: e.target.value })} /></Grid>

                {/* Position inputs */}
              <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="X (%)" value={form.x} onChange={(e) => setForm({ ...form, x: Number(e.target.value) })} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Y (%)" value={form.y} onChange={(e) => setForm({ ...form, y: Number(e.target.value) })} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="W (%)" value={form.w} onChange={(e) => setForm({ ...form, w: Number(e.target.value) })} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="H (%)" value={form.h} onChange={(e) => setForm({ ...form, h: Number(e.target.value) })} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained" sx={{ bgcolor: "#D32F2F" }}>{editMode ? "Save Changes" : "Add Stall"}</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>Mark stall <b>{deleteConfirm}</b> as inactive?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button color="error" onClick={confirmDelete}>Confirm</Button>
          </DialogActions>
        </Dialog>

        {/* --- BOTTOM SLIDE DRAWER (QUICK VIEW + ACTIONS) --- */}
        <SwipeableDrawer
          anchor="bottom"
          open={drawerOpen}
          onClose={handleCloseDrawer}
          onOpen={() => {}}
          disableBackdropTransition={false}
        >
          <Box sx={{ p: 3, borderTopLeftRadius: 8, borderTopRightRadius: 8, minHeight: 180 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedStall ? `${selectedStall.id} — ${selectedStall.location}` : "Stall Details"}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                  Quick details & actions
                </Typography>
              </Box>

              <Box>
                <Button size="small" sx={{ mr: 1 }} onClick={() => {
                  if (selectedStall) { handleEdit(selectedStall); setDrawerOpen(false); }
                }}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => {
                  if (selectedStall) { handleDelete(selectedStall.id); setDrawerOpen(false); }
                }}>
                  Mark Inactive
                </Button>
              </Box>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {selectedStall ? (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography><b>Original Owner:</b> {selectedStall.original_owner}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Present Owner:</b> {selectedStall.original_owner}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Type:</b> {selectedStall.type}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Classification:</b> {selectedStall.classification}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Dimensions:</b> {selectedStall.dimensions}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Capacity:</b> {selectedStall.capacity}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Status:</b> <Chip label={selectedStall.status} sx={{ bgcolor: STATUS_COLORS[selectedStall.status], color: "#fff", fontWeight: 600 }} size="small" /></Typography></Grid>
                <Grid item xs={12} sm={6}><Typography><b>Lease ID:</b> {selectedStall.leaseId || "-"}</Typography></Grid>
                <Grid item xs={12}><Typography><b>Last Updated:</b> {selectedStall.lastUpdated ? new Date(selectedStall.lastUpdated).toLocaleString() : "-"}</Typography></Grid>
                <Grid item xs={12}>
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}><b>Map Position:</b> X {selectedStall.x}% • Y {selectedStall.y}% • W {selectedStall.w}% • H {selectedStall.h}%</Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No stall selected.</Typography>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={handleCloseDrawer}>Close</Button>
              <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={() => {
                if (selectedStall) { handleEdit(selectedStall); setDrawerOpen(false); }
              }}>Edit Stall</Button>
              <Button variant="contained" sx={{bgcolor: "black"}} onClick={handleCloseDrawer}>Stall History</Button>

            </Box>


          </Box>
        </SwipeableDrawer>
      </Box>
    </MainLayout>
  );
}