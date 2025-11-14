// src/pages/inventory/InventoryTracking.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function InventoryTracking() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustment, setAdjustment] = useState({
    quantity: 0,
    reason: "",
    type: "add", // "add" or "subtract"
  });
  const [newItem, setNewItem] = useState({
    name: "",
    qty: 0,
    unitPrice: 0,
    minStock: 10,
  });

  // Load inventory from localStorage
  useEffect(() => {
    const inv = JSON.parse(localStorage.getItem("inventory")) || [
      { id: "ITEM-001", name: "Rice (25kg)", qty: 200, unitPrice: 45, minStock: 50 },
      { id: "ITEM-002", name: "Sugar (50kg)", qty: 120, unitPrice: 55, minStock: 30 },
      { id: "ITEM-003", name: "Cooking Oil (1L)", qty: 80, unitPrice: 150, minStock: 20 },
    ];
    setInventory(inv);
    setFilteredInventory(inv);
  }, []);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  // Filter and search inventory
  useEffect(() => {
    let filtered = inventory;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply low stock filter
    if (filterLowStock) {
      filtered = filtered.filter(item => item.qty <= item.minStock);
    }

    setFilteredInventory(filtered);
  }, [inventory, searchTerm, filterLowStock]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAdjustClick = (item) => {
    setSelectedItem(item);
    setAdjustment({
      quantity: 0,
      reason: "",
      type: "add",
    });
    setAdjustDialogOpen(true);
  };

  const handleAdjustment = () => {
    if (!adjustment.quantity || adjustment.quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!adjustment.reason.trim()) {
      alert("Please enter a reason for adjustment");
      return;
    }

    const updatedInventory = inventory.map(item => {
      if (item.id === selectedItem.id) {
        const newQuantity = adjustment.type === "add" 
          ? item.qty + Number(adjustment.quantity)
          : item.qty - Number(adjustment.quantity);

        // Prevent negative stock
        if (newQuantity < 0) {
          alert("Cannot adjust below 0 quantity");
          return item;
        }

        // Create adjustment record
        const adjustmentRecord = {
          id: uid("ADJ-"),
          itemId: item.id,
          itemName: item.name,
          previousQty: item.qty,
          newQty: newQuantity,
          adjustment: adjustment.type === "add" ? Number(adjustment.quantity) : -Number(adjustment.quantity),
          reason: adjustment.reason,
          date: new Date().toISOString(),
          type: adjustment.type,
        };

        // Save to adjustment history
        const adjustments = JSON.parse(localStorage.getItem("inventoryAdjustments")) || [];
        localStorage.setItem("inventoryAdjustments", JSON.stringify([adjustmentRecord, ...adjustments]));

        return {
          ...item,
          qty: newQuantity,
        };
      }
      return item;
    });

    setInventory(updatedInventory);
    setAdjustDialogOpen(false);
    setSelectedItem(null);
    alert("Inventory adjusted successfully!");
  };

  const handleAddNewItem = () => {
    if (!newItem.name.trim()) {
      alert("Please enter item name");
      return;
    }

    const newInventoryItem = {
      id: `ITEM-${String(inventory.length + 1).padStart(3, "0")}`,
      name: newItem.name.trim(),
      qty: Number(newItem.qty) || 0,
      unitPrice: Number(newItem.unitPrice) || 0,
      minStock: Number(newItem.minStock) || 10,
    };

    const updatedInventory = [...inventory, newInventoryItem];
    setInventory(updatedInventory);
    
    // Reset form and close dialog
    setNewItem({ name: "", qty: 0, unitPrice: 0, minStock: 10 });
    setAddItemDialogOpen(false);
    
    alert(`Item "${newItem.name}" added to inventory!`);
  };

  const getStockStatus = (item) => {
    if (item.qty === 0) return { status: "Out of Stock", color: "error" };
    if (item.qty <= item.minStock) return { status: "Low Stock", color: "warning" };
    return { status: "In Stock", color: "success" };
  };

  const getTotalInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.qty * item.unitPrice), 0);
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.qty <= item.minStock).length;
  };

  const getOutOfStockItems = () => {
    return inventory.filter(item => item.qty === 0).length;
  };

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Inventory Tracking
        </Typography>
        <Typography mb={3} color="text.secondary">
          Monitor and manage your inventory levels in real-time
        </Typography>

        {/* Inventory Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Items
                    </Typography>
                    <Typography variant="h4" component="div">
                      {inventory.length}
                    </Typography>
                  </Box>
                  <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h4" component="div">
                      ₱{getTotalInventoryValue().toLocaleString()}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Low Stock
                    </Typography>
                    <Typography variant="h4" component="div" color="warning.main">
                      {getLowStockItems()}
                    </Typography>
                  </Box>
                  <WarningIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Out of Stock
                    </Typography>
                    <Typography variant="h4" component="div" color="error.main">
                      {getOutOfStockItems()}
                    </Typography>
                  </Box>
                  <TrendingDownIcon color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Paper sx={{ p: 3, mb: 3,  borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)"}}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                placeholder="Search items..."
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant={filterLowStock ? "contained" : "outlined"}
                onClick={() => setFilterLowStock(!filterLowStock)}
                startIcon={<WarningIcon />}
                color="warning"
              >
                Show Low Stock Only
              </Button>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={() => setAddItemDialogOpen(true)}
                sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
              >
                Add New Item
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Inventory Table */}
        <Paper sx={{ p: 3,  borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item ID</TableCell>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="center">Current Stock</TableCell>
                  <TableCell align="center">Min Stock</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No items found. {filterLowStock ? "No low stock items." : "Try adjusting your search filters."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {item.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{item.name}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="h6"
                            color={item.qty <= item.minStock ? "warning.main" : "text.primary"}
                          >
                            {item.qty}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">{item.minStock}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={status.status}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography>₱{item.unitPrice.toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            ₱{(item.qty * item.unitPrice).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleAdjustClick(item)}
                            title="Adjust Stock"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Adjust Stock Dialog */}
        <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Adjust Stock - {selectedItem?.name}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Current Stock: <strong>{selectedItem?.qty}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Adjustment Type"
                  fullWidth
                  value={adjustment.type}
                  onChange={(e) => setAdjustment({ ...adjustment, type: e.target.value })}
                >
                  <MenuItem value="add">
                    <Box display="flex" alignItems="center">
                      <AddIcon sx={{ mr: 1, color: "success.main" }} />
                      Add Stock
                    </Box>
                  </MenuItem>
                  <MenuItem value="subtract">
                    <Box display="flex" alignItems="center">
                      <RemoveIcon sx={{ mr: 1, color: "error.main" }} />
                      Remove Stock
                    </Box>
                  </MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {adjustment.type === "add" ? (
                          <AddIcon color="success" />
                        ) : (
                          <RemoveIcon color="error" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reason for Adjustment"
                  multiline
                  rows={3}
                  fullWidth
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  placeholder="e.g., Damaged goods, Received shipment, etc."
                />
              </Grid>
              {selectedItem && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    New stock will be: <strong>
                      {adjustment.type === "add" 
                        ? selectedItem.qty + Number(adjustment.quantity || 0)
                        : selectedItem.qty - Number(adjustment.quantity || 0)
                      }
                    </strong>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAdjustment}
              variant="contained"
              sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            >
              Confirm Adjustment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add New Item Dialog */}
        <Dialog open={addItemDialogOpen} onClose={() => setAddItemDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Item Name"
                  fullWidth
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g., Flour (25kg)"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Initial Quantity"
                  type="number"
                  fullWidth
                  value={newItem.qty}
                  onChange={(e) => setNewItem({...newItem, qty: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Unit Price (₱)"
                  type="number"
                  fullWidth
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Minimum Stock Level"
                  type="number"
                  fullWidth
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: Number(e.target.value)})}
                  helperText="Alert when stock falls below this level"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddNewItem}
              variant="contained"
              sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}
            >
              Add Item
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}