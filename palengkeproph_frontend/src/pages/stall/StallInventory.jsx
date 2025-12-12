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
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Receipt as ReceiptIcon,
  Note as NoteIcon,
  People as PeopleIcon,
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

// STATUS ICONS
const STATUS_ICONS = {
  Available: CheckCircleIcon,
  Occupied: BusinessIcon,
  Reserved: ScheduleIcon,
  "Under Maintenance": WarningIcon,
  Inactive: BlockIcon,
};

// UTILITY COLORS for map display
const UTILITY_COLORS = {
  Electricity: "#FFEB3B",
  Water: "#2196F3",
  Drainage: "#795548",
  Ventilation: "#9C27B0",
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
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [ownerHistory, setOwnerHistory] = useState([]);

  // Drawer (bottom) state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // sample stalls with schematic placement - UPDATED WITH UTILITY FIELDS
  const [stalls, setStalls] = useState(() => [
    { 
      id: "C-01", 
      original_owner: "John Smith", 
      type: "Tank", 
      section: "Center", 
      location: "Water Tank", 
      dimensions: "6x6m", 
      capacity: 1, 
      status: "Occupied", 
      leaseId: "ADMIN-01", 
      dateAdded: "2025-01-01", 
      lastUpdated: "2025-01-08", 
      x: 68, y: 2, w: 8, h: 8,
      // NEW UTILITY FIELDS
      hasElectricity: true,
      electricityType: "Fixed",
      hasWater: true,
      waterType: "Dedicated",
      hasDrainage: true,
      hasVentilation: false,
      stallStructure: "Fixed"
    },
    { 
      id: "D-83", 
      original_owner: "Brian", 
      type: "Stall", 
      section: "Center", 
      location: "Stall", 
      dimensions: "6x6m", 
      capacity: 1, 
      status: "Available", 
      leaseId: "ADMIN-01", 
      dateAdded: "2025-01-01", 
      lastUpdated: "2025-01-08", 
      x: 74, y: 4, w: 3, h: 4,
      // NEW UTILITY FIELDS
      hasElectricity: true,
      electricityType: "Metered",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: true,
      stallStructure: "Fixed"
    },
    { 
      id: "C-01", 
      original_owner: "Mitra", 
      type: "Admin", 
      section: "Center", 
      location: "ADMIN", 
      dimensions: "6x6m", 
      capacity: 1, 
      status: "Occupied", 
      leaseId: "ADMIN-01", 
      dateAdded: "2025-01-01", 
      lastUpdated: "2025-01-08", 
      x: 68, y: 31, w: 10, h: 14,
      // NEW UTILITY FIELDS
      hasElectricity: true,
      electricityType: "Fixed",
      hasWater: true,
      waterType: "Dedicated",
      hasDrainage: true,
      hasVentilation: true,
      stallStructure: "Fixed"
    },
    { 
      id: "C-01", 
      original_owner: "Charles", 
      type: "CR", 
      section: "Center", 
      location: "CR", 
      dimensions: "6x6m", 
      capacity: 1, 
      status: "Occupied", 
      leaseId: "ADMIN-01", 
      dateAdded: "2025-01-01", 
      lastUpdated: "2025-01-08", 
      x: 64, y: 95, w: 10, h: 14,
      // NEW UTILITY FIELDS
      hasElectricity: true,
      electricityType: "Fixed",
      hasWater: true,
      waterType: "Dedicated",
      hasDrainage: true,
      hasVentilation: true,
      stallStructure: "Fixed"
    },
    { 
      id: "D-53", 
      original_owner: "Charles", 
      type: "Stall", 
      section: "Center", 
      location: "Stall", 
      dimensions: "6x6m", 
      capacity: 1, 
      status: "Under Maintenance", 
      leaseId: "ADMIN-01", 
      dateAdded: "2025-01-01", 
      lastUpdated: "2025-01-08", 
      x: 59, y: 95, w: 5, h: 7,
      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "Optional",
      hasWater: true,
      waterType: "Shared",
      hasDrainage: true,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    },
    { 
      id: "D-54", 
      original_owner: "Charles", 
      type: "Stall", 
      section: "Center", 
      location: "Stall", 
      dimensions: "6x6m", 
      capacity: 1, 
      status: "Inactive", 
      leaseId: "ADMIN-01", 
      dateAdded: "2025-01-01", 
      lastUpdated: "2025-01-08", 
      x: 59, y: 102, w: 5, h: 7,
      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    },

    ...Array.from({ length: 90 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Left Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),
    ...Array.from({ length: 90 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Left Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 18 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Center Left Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 18 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Center Left Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Right Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Right Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Right Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"

    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Right Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Right Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(1, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Right Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 12 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Under Admin Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Upper Admin Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 2 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Above Admin Block",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      type: "Food",
      section: "Under the Map",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Under the Map",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Under the Map",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 8 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Under the Map",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Ambulant Blocks",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Ambulant Blocks",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 6 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Ambulant Blocks",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),

    ...Array.from({ length: 12 }).map((_, i) => ({
      id: `B-${String(i + 1).padStart(0, "0")}`,
      original_owner: "Charles",
      type: "Food",
      section: "Ambulant Blocks",
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

      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "None",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Non-Fixed"
    })),
  ]);
  

  // form state for Add/Edit modal - UPDATED WITH UTILITY FIELDS
  const [form, setForm] = useState({
    id: "",
    type: "",
    section: "",
    location: "",
    dimensions: "",
    capacity: 1,
    status: "Available",
    leaseId: "",
    x: 10,
    y: 10,
    w: 4,
    h: 8,
    // NEW UTILITY FIELDS
    hasElectricity: false,
    electricityType: "Optional",
    hasWater: false,
    waterType: "None",
    hasDrainage: false,
    hasVentilation: false,
    stallStructure: "Fixed"
  });

  const statuses = ["Available", "Occupied", "Reserved", "Under Maintenance", "Inactive"];
  const electricityTypes = ["Fixed", "Metered", "Optional", "None"];
  const waterTypes = ["Shared", "Dedicated", "None"];
  const structureTypes = ["Fixed", "Non-Fixed"];

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {};
    statuses.forEach(status => {
      counts[status] = stalls.filter(stall => stall.status === status).length;
    });
    return counts;
  }, [stalls]);

  // Calculate total stalls
  const totalStalls = stalls.length;

  // filtered stalls (search) - UPDATED TO INCLUDE UTILITY FIELDS IN SEARCH
  const filtered = useMemo(() => {
    if (!search.trim()) return stalls;
    const q = search.toLowerCase();
    return stalls.filter((s) => 
      Object.values(s).join(" ").toLowerCase().includes(q) ||
      (s.hasElectricity && "electricity".includes(q)) ||
      (s.hasWater && "water".includes(q)) ||
      (s.hasDrainage && "drainage".includes(q)) ||
      (s.hasVentilation && "ventilation".includes(q)) ||
      s.electricityType.toLowerCase().includes(q) ||
      s.waterType.toLowerCase().includes(q) ||
      s.stallStructure.toLowerCase().includes(q)
    );
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

  // open add modal - UPDATED WITH UTILITY FIELDS
  const handleAddNew = () => {
    setForm({
      id: "",
      type: "",
      section: "",
      location: "",
      dimensions: "",
      capacity: 1,
      status: "Available",
      leaseId: "",
      x: 20,
      y: 20,
      w: 6,
      h: 6,
      // NEW UTILITY FIELDS
      hasElectricity: false,
      electricityType: "Optional",
      hasWater: false,
      waterType: "None",
      hasDrainage: false,
      hasVentilation: false,
      stallStructure: "Fixed"
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
    setTimeout(() => setSelectedStall(null), 200);
  };

  // quick map click -> open drawer (and allow edit from there)
  const handleMapClick = (stall) => {
    handleOpenDrawer(stall);
  };

  /*** ===== Pan + Zoom Map State & Handlers ===== ***/
  const mapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const minScale = 0.4;
  const maxScale = 4;

  // When in map view -> disable page scroll
  useEffect(() => {
    if (view === "map") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [view]);

  // helper: clamp
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // wheel — zoom towards pointer
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newScaleUnclamped = scale + delta;
    const newScale = clamp(newScaleUnclamped, minScale, maxScale);
    if (!mapRef.current) {
      setScale(newScale);
      return;
    }

    const rect = mapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleFactor = newScale / scale;
    const newOffsetX = offset.x - (mouseX) * (scaleFactor - 1);
    const newOffsetY = offset.y - (mouseY) * (scaleFactor - 1);

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // pointer down -> start dragging
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    setDragging(true);
    draggingRef.current = true;
    startRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };

    window.addEventListener("mousemove", handleWindowPointerMove);
    window.addEventListener("mouseup", handleWindowPointerUp);
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
    window.removeEventListener("mousemove", handleWindowPointerMove);
    window.removeEventListener("mouseup", handleWindowPointerUp);
    window.removeEventListener("mouseleave", handleWindowPointerUp);
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleWindowPointerMove);
      window.removeEventListener("mouseup", handleWindowPointerUp);
      window.removeEventListener("mouseleave", handleWindowPointerUp);
    };
  }, []);

  // zoom controls
  const zoomIn = () => setScale((s) => clamp(s + 0.2, minScale, maxScale));
  const zoomOut = () => setScale((s) => clamp(s - 0.2, minScale, maxScale));
  const centerMap = () => setOffset({ x: 0, y: 0 });

  /*** ===== NEW: Utility-based filtering for map ===== ***/
  const [utilityFilters, setUtilityFilters] = useState({
    hasElectricity: false,
    hasWater: false,
    hasDrainage: false,
    hasVentilation: false,
    stallStructure: "All"
  });

  const filteredWithUtilities = useMemo(() => {
    let result = filtered;
    
    if (utilityFilters.hasElectricity) {
      result = result.filter(stall => stall.hasElectricity);
    }
    if (utilityFilters.hasWater) {
      result = result.filter(stall => stall.hasWater);
    }
    if (utilityFilters.hasDrainage) {
      result = result.filter(stall => stall.hasDrainage);
    }
    if (utilityFilters.hasVentilation) {
      result = result.filter(stall => stall.hasVentilation);
    }
    if (utilityFilters.stallStructure !== "All") {
      result = result.filter(stall => stall.stallStructure === utilityFilters.stallStructure);
    }
    
    return result;
  }, [filtered, utilityFilters]);

  // Function to get stall border based on utilities
  const getStallBorder = (stall) => {
    const borders = [];
    if (stall.hasElectricity) borders.push(`2px solid ${UTILITY_COLORS.Electricity}`);
    if (stall.hasWater) borders.push(`2px solid ${UTILITY_COLORS.Water}`);
    if (stall.hasDrainage) borders.push(`2px solid ${UTILITY_COLORS.Drainage}`);
    if (stall.hasVentilation) borders.push(`2px solid ${UTILITY_COLORS.Ventilation}`);
    
    return borders.length > 0 ? borders.join(', ') : 'none';
  };

  const generateOwnerHistory = (stallId) => {
    const histories = {
      "C-01": [
        { 
          id: 1, 
          ownerName: "John Smith", 
          contact: "0912-345-6789",
          email: "john.smith@email.com",
          startDate: "2023-01-01", 
          endDate: null, 
          status: "Active", 
          type: "Current Owner",
          leaseId: "LEASE-2023-001",
          paymentStatus: "Paid",
          notes: "Regular tenant, pays on time",
          duration: "1 year 2 months"
        },
        { 
          id: 2, 
          ownerName: "Maria Garcia", 
          contact: "0917-890-1234",
          email: "maria.garcia@email.com",
          startDate: "2021-06-01", 
          endDate: "2022-12-31", 
          status: "Completed", 
          type: "Previous Owner",
          leaseId: "LEASE-2021-045",
          paymentStatus: "Completed",
          notes: "Moved to larger stall",
          duration: "1 year 7 months"
        },
      ],
      "D-83": [
        { 
          id: 1, 
          ownerName: "Brian Chen", 
          contact: "0915-678-9012",
          email: "brian.chen@email.com",
          startDate: "2023-03-15", 
          endDate: null, 
          status: "Active", 
          type: "Current Owner",
          leaseId: "LEASE-2023-023",
          paymentStatus: "Pending",
          notes: "New tenant, first month",
          duration: "11 months"
        },
      ],
    };
    
    // Default history if stall not found
    return histories[stallId] || [
      { 
        id: 1, 
        ownerName: selectedStall?.original_owner || "Unknown Owner", 
        contact: "N/A",
        email: "N/A",
        startDate: new Date().toISOString().split('T')[0], 
        endDate: null, 
        status: "Active", 
        type: "Current Owner",
        leaseId: "N/A",
        paymentStatus: "N/A",
        notes: "No history available",
        duration: "N/A"
      },
    ];
  };

  // Function to open owner history drawer
  const handleOpenHistoryDrawer = (stall) => {
    setSelectedStall(stall);
    const history = generateOwnerHistory(stall.id);
    setOwnerHistory(history);
    setHistoryDrawerOpen(true);
  };

  const handleCloseHistoryDrawer = () => {
    setHistoryDrawerOpen(false);
    setTimeout(() => {
      setOwnerHistory([]);
    }, 200);
  };

  // Function to update current owner
  const updateCurrentOwner = () => {
    const newOwnerName = prompt("Enter new owner name:");
    if (newOwnerName && selectedStall) {
      // In real app, you would save to database here
      alert(`Owner updated to: ${newOwnerName}\n\nIn a real application, this would save to the database.`);
      
      // Update local state for demo
      const updatedHistory = ownerHistory.map(owner => 
        owner.status === "Active" 
          ? { ...owner, status: "Completed", endDate: new Date().toISOString().split('T')[0] }
          : owner
      );
      
      const newOwner = {
        id: updatedHistory.length + 1,
        ownerName: newOwnerName,
        contact: "New contact",
        email: "new@email.com",
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        status: "Active",
        type: "Current Owner",
        leaseId: `LEASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 100)}`,
        paymentStatus: "Pending",
        notes: "Newly added tenant",
        duration: "0 months"
      };
      
      setOwnerHistory([newOwner, ...updatedHistory]);
    }
  };

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

        {/* NEW: Status Monitoring Container */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "#f8f9fa" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Stall Status Overview</Typography>
          <Grid container spacing={2}>
            {/* Total Stalls Card */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ 
                borderLeft: '4px solid #666',
                height: '100%',
                '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700} color="text.primary">
                        {totalStalls}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Stalls
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: '#666', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Typography variant="h6" color="white" fontWeight={700}>
                        Σ
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Status Cards */}
            {statuses.map((status) => {
              const IconComponent = STATUS_ICONS[status];
              const count = statusCounts[status];
              const percentage = totalStalls > 0 ? ((count / totalStalls) * 100).toFixed(1) : 0;
              
              return (
                <Grid item xs={12} sm={6} md={2.4} key={status}>
                  <Card 
                    sx={{ 
                      borderLeft: `4px solid ${STATUS_COLORS[status]}`,
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { 
                        transform: 'translateY(-2px)', 
                        transition: 'transform 0.2s',
                        boxShadow: 2 
                      }
                    }}
                    onClick={() => {
                      setSearch(status);
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h4" fontWeight={700} color="text.primary">
                            {count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {status}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {percentage}% of total
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: STATUS_COLORS[status], 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <IconComponent sx={{ color: 'white' }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          
          {/* Summary Stats */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Available Rate</Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {totalStalls > 0 ? ((statusCounts['Available'] / totalStalls) * 100).toFixed(1) : 0}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Occupancy Rate</Typography>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  {totalStalls > 0 ? (((statusCounts['Occupied'] + statusCounts['Reserved']) / totalStalls) * 100).toFixed(1) : 0}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Maintenance Rate</Typography>
                <Typography variant="h6" fontWeight={600} color="warning.main">
                  {totalStalls > 0 ? ((statusCounts['Under Maintenance'] / totalStalls) * 100).toFixed(1) : 0}%
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">Inactive Rate</Typography>
                <Typography variant="h6" fontWeight={600} color="text.secondary">
                  {totalStalls > 0 ? ((statusCounts['Inactive'] / totalStalls) * 100).toFixed(1) : 0}%
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* NEW: Utility Filters for Map View Only */}
        {view === "map" && (
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Utility Filters</Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={utilityFilters.hasElectricity}
                    onChange={(e) => setUtilityFilters({...utilityFilters, hasElectricity: e.target.checked})}
                    sx={{ color: UTILITY_COLORS.Electricity, '&.Mui-checked': { color: UTILITY_COLORS.Electricity } }}
                  />
                }
                label="Electricity"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={utilityFilters.hasWater}
                    onChange={(e) => setUtilityFilters({...utilityFilters, hasWater: e.target.checked})}
                    sx={{ color: UTILITY_COLORS.Water, '&.Mui-checked': { color: UTILITY_COLORS.Water } }}
                  />
                }
                label="Water"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={utilityFilters.hasDrainage}
                    onChange={(e) => setUtilityFilters({...utilityFilters, hasDrainage: e.target.checked})}
                    sx={{ color: UTILITY_COLORS.Drainage, '&.Mui-checked': { color: UTILITY_COLORS.Drainage } }}
                  />
                }
                label="Drainage"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={utilityFilters.hasVentilation}
                    onChange={(e) => setUtilityFilters({...utilityFilters, hasVentilation: e.target.checked})}
                    sx={{ color: UTILITY_COLORS.Ventilation, '&.Mui-checked': { color: UTILITY_COLORS.Ventilation } }}
                  />
                }
                label="Ventilation"
              />
              <TextField
                size="small"
                select
                label="Structure Type"
                value={utilityFilters.stallStructure}
                onChange={(e) => setUtilityFilters({...utilityFilters, stallStructure: e.target.value})}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="All">All Structures</MenuItem>
                <MenuItem value="Fixed">Fixed</MenuItem>
                <MenuItem value="Non-Fixed">Non-Fixed</MenuItem>
              </TextField>
            </Box>
          </Paper>
        )}

        {/* Table View - KEPT CLEAN (no utility columns) */}
        {view === "table" && (
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><b>Stall ID</b></TableCell>
                  <TableCell><b>Original Owner</b></TableCell>
                  <TableCell><b>Type</b></TableCell>
                  <TableCell><b>Section</b></TableCell>
                  {/* <TableCell><b>Location</b></TableCell> */}
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
                    <TableCell>{stall.section}</TableCell>
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

        {/* Map View - UPDATED WITH UTILITY BORDERS */}
        {view === "map" && (
          <Paper sx={{ borderRadius: 3, p: 2, position: "relative", overflow: "hidden" }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Visual Market Layout (Schematic)</Typography>
            <Legend />
            {/* Utility Legend */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: UTILITY_COLORS.Electricity, border: "1px solid #ccc" }}></Box>
                <Typography variant="caption">Electricity</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: UTILITY_COLORS.Water, border: "1px solid #ccc" }}></Box>
                <Typography variant="caption">Water</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: UTILITY_COLORS.Drainage, border: "1px solid #ccc" }}></Box>
                <Typography variant="caption">Drainage</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: UTILITY_COLORS.Ventilation, border: "1px solid #ccc" }}></Box>
                <Typography variant="caption">Ventilation</Typography>
              </Box>
            </Box>
            
            <Box
              sx={{
                height: "calc(100vh - 260px)",
                position: "relative",
                pb: 8,
              }}
            >
              <Box
                ref={mapRef}
                sx={{
                  width: "100%",
                  position: "relative",
                  pt: "56%",
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

                  {/* Your existing static schematic regions */}
                  <Box sx={{ position: "absolute", left: "-45%", top: "-20%", width: "24%", height: "114%", border: "5px dashed #757575ff", borderRadius: 1, px: 1, py: 1, textAlign: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 1 }}></Box>
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

                  {/* Render stalls with utility borders */}
                  {filteredWithUtilities.map((s) => {
                    const matchSearch = search.trim() ? filtered.some((fs) => fs.id === s.id) : true;
                    return (
                      <Tooltip key={s.id} title={
                        <Box>
                          <div><strong>{s.id} — {s.status}</strong></div>
                          <div>Electricity: {s.hasElectricity ? s.electricityType : "No"}</div>
                          <div>Water: {s.hasWater ? s.waterType : "No"}</div>
                          <div>Drainage: {s.hasDrainage ? "Yes" : "No"}</div>
                          <div>Ventilation: {s.hasVentilation ? "Yes" : "No"}</div>
                          <div>Structure: {s.stallStructure}</div>
                        </Box>
                      }>
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
                            border: getStallBorder(s),
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

            {/* STICKY CONTROLS */}
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
              <Button variant="outlined" size="small" onClick={() => alert("Export to PNG: placeholder (implement with html2canvas).")}>Export Map (PNG)</Button>
              <Button variant="outlined" size="small" onClick={centerMap}>Center</Button>
              <Button variant="outlined" size="small" onClick={zoomIn}>Zoom In</Button>
              <Button variant="outlined" size="small" onClick={zoomOut}>Zoom Out</Button>
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

        {/* Add / Edit Modal - UPDATED WITH UTILITY FIELDS */}
        <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ bgcolor: "#D32F2F", color: "#fff" }}>{editMode ? "Edit Stall Details" : "Add New Stall"}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Original Owner" value={form.original_owner} onChange={(e) => setForm({ ...form, section: e.target.value })} /></Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Stall Type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {["Fish", "Meat", "Parking", "Fixed Stall", "Food Stall", "Terminal", "Gutter", "Bazaar", "Vegetable", "RTW", "Green Tent", "Red Tent"].map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} /></Grid>
              <Grid item xs={6} sm={3}><TextField fullWidth type="number" label="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Grid>
              <Grid item xs={6} sm={3}>
                <TextField fullWidth select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Lease ID (optional)" value={form.leaseId} onChange={(e) => setForm({ ...form, leaseId: e.target.value })} /></Grid>

              {/* NEW UTILITY FIELDS */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Utility Information</Typography>
                <Divider />
              </Grid>

              {/* Electricity */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasElectricity}
                      onChange={(e) => setForm({ ...form, hasElectricity: e.target.checked })}
                    />
                  }
                  label="Has Electricity"
                />
                {form.hasElectricity && (
                  <TextField
                    fullWidth
                    select
                    label="Electricity Type"
                    value={form.electricityType}
                    onChange={(e) => setForm({ ...form, electricityType: e.target.value })}
                    sx={{ mt: 1 }}
                  >
                    {electricityTypes.filter(type => type !== "None").map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>

              {/* Water */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasWater}
                      onChange={(e) => setForm({ ...form, hasWater: e.target.checked })}
                    />
                  }
                  label="Has Water Supply"
                />
                {form.hasWater && (
                  <TextField
                    fullWidth
                    select
                    label="Water Type"
                    value={form.waterType}
                    onChange={(e) => setForm({ ...form, waterType: e.target.value })}
                    sx={{ mt: 1 }}
                  >
                    {waterTypes.filter(type => type !== "None").map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>

              {/* Drainage & Ventilation */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasDrainage}
                      onChange={(e) => setForm({ ...form, hasDrainage: e.target.checked })}
                    />
                  }
                  label="Has Drainage"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.hasVentilation}
                      onChange={(e) => setForm({ ...form, hasVentilation: e.target.checked })}
                    />
                  }
                  label="Has Ventilation"
                />
              </Grid>

              {/* Structure Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Stall Structure"
                  value={form.stallStructure}
                  onChange={(e) => setForm({ ...form, stallStructure: e.target.value })}
                >
                  {structureTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>

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

        {/* --- BOTTOM SLIDE DRAWER (QUICK VIEW + ACTIONS) - UPDATED WITH UTILITIES --- */}
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
                <Grid item xs={12} sm={6}><Typography><b>Section:</b> {selectedStall.section}</Typography></Grid>
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

                
                {/* UTILITIES SECTION AT THE BOTTOM */}
                <Grid item xs={12} sx={{ borderTop: "1px solid #eee" }}>
                  <Typography variant="subtitle1" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>Utilities:</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6}><Typography><b>Electricity:</b> {selectedStall.hasElectricity ? selectedStall.electricityType : "No"}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography><b>Water:</b> {selectedStall.hasWater ? selectedStall.waterType : "No"}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography><b>Drainage:</b> {selectedStall.hasDrainage ? "Yes" : "No"}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography><b>Ventilation:</b> {selectedStall.hasVentilation ? "Yes" : "No"}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography><b>Structure:</b> {selectedStall.stallStructure}</Typography></Grid>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No stall selected.</Typography>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
              <Button variant="contained"  sx={{ bgcolor: "hsla(209, 100%, 38%, 1.00)" }} onClick={handleCloseDrawer}>Close</Button>
              <Button variant="contained" sx={{ bgcolor: "#D32F2F" }} onClick={() => {
                if (selectedStall) { handleEdit(selectedStall); setDrawerOpen(false); }
              }}>Edit Stall</Button>
              <Button 
                variant="contained" 
                sx={{bgcolor: "black"}} 
                onClick={() => {
                  if (selectedStall) {
                    handleOpenHistoryDrawer(selectedStall);
                    setDrawerOpen(false);
                  }
                }}
                startIcon={<HistoryIcon />}
              >
                Stall History
              </Button>            
            </Box>
          </Box>
        </SwipeableDrawer>
      </Box>


              {/* ===== STALL HISTORY DRAWER ===== */}
        <SwipeableDrawer
          anchor="bottom"
          open={historyDrawerOpen}
          onClose={handleCloseHistoryDrawer}
          onOpen={() => {}}
          disableBackdropTransition={false}
          PaperProps={{
            sx: {
              height: "75vh",
              maxHeight: "75vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }
          }}
        >
          <Box sx={{ p: 3, overflowY: "auto", height: "100%" }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#D32F2F" }}>
                  Stall Ownership History
                </Typography>
                <Typography color="text.secondary">
                  {selectedStall ? `${selectedStall.id} - ${selectedStall.location} - ${selectedStall.type}` : ""}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseHistoryDrawer} sx={{ bgcolor: "#f5f5f5" }}>
                <ArrowForwardIcon />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {selectedStall && (
              <>
                {/* Current Owner Section */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: "#e8f5e9", borderLeft: "4px solid #4CAF50" }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#2E7D32" }}>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Current Owner
                  </Typography>
                  
                  {ownerHistory.find(item => item.status === "Active") ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {ownerHistory.find(item => item.status === "Active")?.ownerName}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2">
                            {ownerHistory.find(item => item.status === "Active")?.contact}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2">
                            {ownerHistory.find(item => item.status === "Active")?.email}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2">
                            <b>Lease:</b> {ownerHistory.find(item => item.status === "Active")?.leaseId}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2">
                            <b>Since:</b> {ownerHistory.find(item => item.status === "Active")?.startDate}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="body2">
                            <b>Duration:</b> {ownerHistory.find(item => item.status === "Active")?.duration}
                          </Typography>
                        </Box>
                        <Chip 
                          label={ownerHistory.find(item => item.status === "Active")?.paymentStatus} 
                          color={
                            ownerHistory.find(item => item.status === "Active")?.paymentStatus === "Paid" ? "success" : 
                            ownerHistory.find(item => item.status === "Active")?.paymentStatus === "Pending" ? "warning" : "error"
                          }
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                      {ownerHistory.find(item => item.status === "Active")?.notes && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                            <NoteIcon sx={{ fontSize: 16, color: '#666', mt: 0.25 }} />
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {ownerHistory.find(item => item.status === "Active")?.notes}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">No active owner assigned</Typography>
                  )}
                </Paper>

                {/* Previous Owners */}
                {ownerHistory.filter(item => item.status === "Completed").length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Previous Owners ({ownerHistory.filter(item => item.status === "Completed").length})
                    </Typography>
                    
                    <List>
                      {ownerHistory
                        .filter(item => item.status === "Completed")
                        .map((item) => (
                          <ListItem 
                            key={item.id}
                            sx={{ 
                              bgcolor: '#f9f9f9',
                              mb: 1,
                              borderRadius: 1,
                              border: '1px solid #eee'
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: '#757575' }}>
                                {item.ownerName.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {item.ownerName}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {item.type}
                                  </Typography>
                                  {` • ${item.startDate} to ${item.endDate}`}
                                  <br />
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    <PhoneIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                    {item.contact}
                                  </Typography>
                                  <br />
                                  <Typography component="span" variant="body2" color="text.secondary">
                                    Lease: {item.leaseId} • Duration: {item.duration}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </>
                )}

                {/* Simple Timeline */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
                  Ownership Timeline
                </Typography>
                
                <Box sx={{ ml: 3, pl: 2, borderLeft: '2px dashed #ccc', position: 'relative' }}>
                  {ownerHistory.map((item, index) => (
                    <Box key={item.id} sx={{ mb: 2, position: 'relative' }}>
                      <Box sx={{
                        position: 'absolute',
                        left: -10,
                        top: 4,
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: item.status === "Active" ? '#4CAF50' : '#757575',
                        border: '2px solid white',
                        boxShadow: 1
                      }} />
                      <Typography variant="body1" fontWeight={600}>
                        {item.ownerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <CalendarIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        {item.startDate} {item.endDate ? `→ ${item.endDate}` : '(Current)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.type} • {item.duration}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button 
                    variant="outlined" 
                    onClick={updateCurrentOwner}
                    startIcon={<PersonIcon />}
                  >
                    Update Owner
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleCloseHistoryDrawer}
                    sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
                  >
                    Close History
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </SwipeableDrawer>
    </MainLayout>
  );
}