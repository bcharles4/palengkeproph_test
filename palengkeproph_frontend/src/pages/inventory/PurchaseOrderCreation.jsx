// src/pages/purchase/PurchaseOrder.jsx (UPDATED VERSION)
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TableContainer,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";

function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9).toUpperCase();
}

export default function PurchaseOrder() {
  // Inventory items (loaded from localStorage)
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // PO form
  const [vendor, setVendor] = useState("");
  const [poDate, setPoDate] = useState("");
  const [items, setItems] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Add Item Dialog
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    qty: 0,
    unitPrice: 0,
    minStock: 10 // Added minStock for consistency
  });

  useEffect(() => {
    const inv = JSON.parse(localStorage.getItem("inventory")) || [
      { id: "ITEM-001", name: "Rice (25kg)", qty: 200, unitPrice: 45, minStock: 50 },
      { id: "ITEM-002", name: "Sugar (50kg)", qty: 120, unitPrice: 55, minStock: 30 },
      { id: "ITEM-003", name: "Cooking Oil (1L)", qty: 80, unitPrice: 150, minStock: 20 },
    ];
    const pos = JSON.parse(localStorage.getItem("purchaseOrders")) || [];
    setInventory(inv);
    setPurchaseOrders(pos);
  }, []);

  // persist POs & inventory whenever they change
  useEffect(() => {
    localStorage.setItem("purchaseOrders", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  const addRow = () => {
    setItems((s) => [
      ...s,
      { key: uid("ROW-"), itemId: "", name: "", qty: 1, price: 0, lineTotal: 0 },
    ]);
  };

  const updateRow = (key, changes) => {
    setItems((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...changes, lineTotal: ((changes.qty ?? r.qty) * (changes.price ?? r.price)).toFixed(2) } : r))
    );
  };

  const removeRow = (key) => {
    setItems((prev) => prev.filter((r) => r.key !== key));
  };

  const handleSelectItem = (key, itemId) => {
    const invItem = inventory.find((i) => i.id === itemId);
    if (!invItem) return;
    updateRow(key, { itemId: invItem.id, name: invItem.name, price: invItem.unitPrice, qty: 1 });
  };

  const calcTotal = () => {
    return items.reduce((sum, r) => sum + Number(r.lineTotal || 0), 0).toFixed(2);
  };

  const handleSavePO = () => {
    if (!vendor || !poDate || items.length === 0) {
      alert("Please fill vendor, date and add at least one item.");
      return;
    }
    if (items.some((r) => !r.itemId || r.qty <= 0 || !r.price)) {
      alert("Please complete all item rows (select item, qty > 0, price).");
      return;
    }
    const newPO = {
      id: `PO-${String(purchaseOrders.length + 1).padStart(4, "0")}`,
      vendor,
      date: poDate,
      items,
      total: calcTotal(),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    setPurchaseOrders((p) => [newPO, ...p]);
    // clear form
    setVendor("");
    setPoDate("");
    setItems([]);
    alert("Purchase Order saved (status: Pending).");
  };

  // Mark PO as received -> update inventory quantities
  const markAsReceived = (poId) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po) return;
    // update inventory
    const updatedInventory = [...inventory];
    po.items.forEach((row) => {
      const idx = updatedInventory.findIndex((it) => it.id === row.itemId);
      if (idx !== -1) {
        updatedInventory[idx].qty = Number(updatedInventory[idx].qty) + Number(row.qty);
      } else {
        // item not exist in inventory -> add with proper structure
        const existingItem = inventory.find(item => item.name === row.name);
        const minStock = existingItem ? existingItem.minStock : 10; // Use existing minStock or default
        
        updatedInventory.push({ 
          id: row.itemId || uid("ITEM-"), 
          name: row.name || "Unknown", 
          qty: Number(row.qty), 
          unitPrice: Number(row.price),
          minStock: minStock
        });
      }
    });
    setInventory(updatedInventory);

    // change PO status
    const updatedPOs = purchaseOrders.map((p) => (p.id === poId ? { ...p, status: "Received", receivedAt: new Date().toISOString() } : p));
    setPurchaseOrders(updatedPOs);
    alert(`PO ${poId} marked as Received and inventory updated.`);
  };

  const cancelPO = (poId) => {
    if (!window.confirm("Cancel this PO?")) return;
    setPurchaseOrders((p) => p.filter((x) => x.id !== poId));
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
      minStock: Number(newItem.minStock) || 10, // Include minStock
    };

    const updatedInventory = [...inventory, newInventoryItem];
    setInventory(updatedInventory);
    
    // Reset form and close dialog
    setNewItem({ name: "", qty: 0, unitPrice: 0, minStock: 10 });
    setAddItemOpen(false);
    
    alert(`Item "${newItem.name}" added to inventory!`);
  };

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Purchase Order Creation
        </Typography>
        <Typography mb={2} color="text.secondary">
          Create a purchase order. When a PO is marked as "Received" the inventory quantities will be increased automatically.
        </Typography>

        <Paper sx={{ p: 3, mb: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField label="Vendor" fullWidth value={vendor} onChange={(e) => setVendor(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="PO Date" type="date" fullWidth value={poDate} InputLabelProps={{ shrink: true }} onChange={(e) => setPoDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Button startIcon={<AddIcon />} variant="contained" onClick={addRow} sx={{ mr: 1,  bgcolor: "#111", "&:hover": { bgcolor: "#333" } }}>
                Add Item
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => setAddItemOpen(true)}
                sx={{ mr: 1, borderColor: "#111", color: "#111", "&:hover": { borderColor: "#333", color: "#333" } }}
              >
                New Inventory Item
              </Button>
              <Button variant="outlined" onClick={() => setPreviewOpen(true)}
                sx={{ mr: 1, borderColor: "#111", color: "#111", "&:hover": { borderColor: "#333", color: "#333" } }}
>
                Preview
              </Button>
            </Grid>
          </Grid>

          <Box mt={2}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="35%">Item</TableCell>
                    <TableCell width="15%">Qty</TableCell>
                    <TableCell width="20%">Unit Price</TableCell>
                    <TableCell width="20%">Line Total</TableCell>
                    <TableCell width="10%"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No items. Click "Add Item" to start.</TableCell>
                    </TableRow>
                  )}
                  {items.map((r) => (
                    <TableRow key={r.key}>
                      <TableCell>
                        <TextField 
                          select 
                          fullWidth 
                          size="small" 
                          value={r.itemId} 
                          onChange={(e) => handleSelectItem(r.key, e.target.value)}
                        >
                          <MenuItem value="">-- Select item --</MenuItem>
                          {inventory.map((it) => (
                            <MenuItem key={it.id} value={it.id}>
                              {it.name} ({it.id}) - Stock: {it.qty}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={r.qty} 
                          onChange={(e) => updateRow(r.key, { qty: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField 
                          type="number" 
                          size="small" 
                          value={r.price} 
                          onChange={(e) => updateRow(r.key, { price: Number(e.target.value) })}
                        />
                      </TableCell>
                      <TableCell>{r.lineTotal || "0.00"}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => removeRow(r.key)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
            <Typography variant="h6">Total: ₱ {calcTotal()}</Typography>
            <Button variant="contained" color="primary" onClick={handleSavePO} sx={{ bgcolor: "#D32F2F", "&:hover": { bgcolor: "#B71C1C" } }}>
              Save Purchase Order
            </Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", borderRadius: 3  }}>
          <Typography variant="h6" gutterBottom>Existing Purchase Orders</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>PO ID</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total (₱)</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseOrders.length === 0 && (
                  <TableRow><TableCell colSpan={6} align="center">No purchase orders found.</TableCell></TableRow>
                )}
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>{po.id}</TableCell>
                    <TableCell>{po.vendor}</TableCell>
                    <TableCell>{po.date}</TableCell>
                    <TableCell>{Number(po.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Typography 
                        fontWeight="bold" 
                        color={po.status === "Received" ? "success.main" : "warning.main"}
                      >
                        {po.status}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {po.status === "Pending" && (
                        <Button 
                          size="small" 
                          onClick={() => markAsReceived(po.id)} 
                          sx={{ mr: 1 }}
                          variant="outlined"
                          color="success"
                        >
                          Mark Received
                        </Button>
                      )}
                      <Button size="small" color="error" onClick={() => cancelPO(po.id)}>
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Purchase Order Preview</DialogTitle>
          <DialogContent dividers>
            <Typography><b>Vendor:</b> {vendor}</Typography>
            <Typography><b>Date:</b> {poDate}</Typography>
            <Box mt={2}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Line Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((r) => (
                    <TableRow key={r.key}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.qty}</TableCell>
                      <TableCell>{Number(r.price).toFixed(2)}</TableCell>
                      <TableCell>{Number(r.lineTotal).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Box mt={2} textAlign="right"><b>Grand Total: ₱ {calcTotal()}</b></Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button 
              onClick={() => { 
                setPreviewOpen(false); 
                handleSavePO(); 
              }} 
              variant="contained" 
              sx={{ bgcolor: "#333", "&:hover": { bgcolor: "#111" } }}
            >
              Save & Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add New Item Dialog */}
        <Dialog open={addItemOpen} onClose={() => setAddItemOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogContent>
            <DialogContentText mb={2}>
              Add a new item to your inventory that can be used in purchase orders.
            </DialogContentText>
            <Grid container spacing={2}>
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
            <Button onClick={() => setAddItemOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddNewItem}
              variant="contained"
              sx={{ bgcolor: "#333", "&:hover": { bgcolor: "#111" } }}
            >
              Add Item
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MainLayout>
  );
}