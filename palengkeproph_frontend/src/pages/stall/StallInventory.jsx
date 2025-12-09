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
  FormControlLabel,
  Checkbox,
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

  // Drawer (bottom) state
  const [drawerOpen, setDrawerOpen] = useState(false);

  // sample stalls with schematic placement - UPDATED WITH UTILITY FIELDS
  const [stalls, setStalls] = useState(() => [
    { 
      id: "C-01", 
      original_owner: "Charles", 
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
      <Button variant="contained" sx={{bgcolor: "black"}} onClick={handleCloseDrawer}>Stall History</Button>
    </Box>
  </Box>
</SwipeableDrawer>
      </Box>
    </MainLayout>
  );
}