import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Tooltip,
  Paper,
  ListItemButton,
  ClickAwayListener,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  ExpandLess,
  ExpandMore,
  ListAlt as ListAltIcon,
  AddBusiness as AddBusinessIcon,
  Insights as InsightsIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  Inventory2 as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  CreditScore as CreditScoreIcon,
  MapsHomeWork as MapsHomeWorkIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  AccountBox as AccountBoxIcon,
  Payment as PaymentIcon,
  Paid as PaidIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Feed as FeedIcon
} from "@mui/icons-material";

import { Link, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;
const collapsedWidth = 70;

export default function MainLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [openDropdowns, setOpenDropdowns] = useState({
    stall: false,
    tenant: false,
    lease: false,
    inventory: false,
    expense: false,
    payment: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => setOpen(!open);

  // ✅ Improved: only one dropdown open at a time
  const handleDropdownToggle = (key) => {
    setOpenDropdowns((prev) => {
      const updated = {};
      Object.keys(prev).forEach((k) => {
        updated[k] = k === key ? !prev[k] : false;
      });
      return updated;
    });
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", keywords: ["dashboard", "home", "main"] },

    {
      text: "Stall Management",
      key: "stall",
      icon: <MapsHomeWorkIcon />,
      children: [
        { text: "Stall Inventory", icon: <StoreIcon />, path: "/stall-inventory", keywords: ["stall", "inventory", "stalls", "market"] },
        { text: "Stall Available", icon: <AddBusinessIcon />, path: "/stall-available", keywords: ["stall", "assignment", "assign", "allocate"] },
      ],
    },

    {
      text: "Lease Management",
      key: "lease",
      icon: <FeedIcon />,
      children: [
        {text: "Lease Records", icon: <ListAltIcon />, path: "/lease-records", keywords: ["lease", "list", "leases", "agreements"] },
        { text: "Lease Creation", icon: <AssessmentIcon />, path: "/lease-creation", keywords: ["lease", "creation", "create", "new", "agreement"] },
        { text: "Lease Approval", icon: <InsightsIcon />, path: "/lease-approval-list", keywords: ["lease", "approval", "approve", "review", "agreement"] }, // CHANGED HERE
        { text: "Lease Renewal", icon: <InsightsIcon />, path: "/lease-renewal", keywords: ["lease", "renewal", "renew", "extend", "agreement"] },
      ],
    },
    
    { text: "Tenant Management", icon: <AccountBoxIcon />, path: "/tenant-account-management", keywords: ["tenant", "account", "management", "accounts"] },


    // {
    //   text: "Tenant Management",
    //   key: "tenant",
    //   icon: <AccountBoxIcon />,
    //   children: [
    //     // { text: "Tenant List", icon: <ListAltIcon />, path: "/tenant-list", keywords: ["tenant", "list", "tenants", "people", "business"] },
    //     // { text: "Tenant Information", icon: <AddBusinessIcon />, path: "/tenant-information", keywords: ["tenant", "information", "details", "profile"] },
    //     // { text: "Tenant List", icon: <ListAltIcon />, path: "/tenant-account-management", keywords: ["tenant", "account", "management", "accounts"] },

    //   ],
    // },

    {
      text: "Market Collections",
      key: "payment",
      icon: <PaymentIcon />,
      children: [
        { text: "Payment Recording", icon: <ListAltIcon />, path: "/payment-recording", keywords: ["payment", "recording", "new", "add"] },
        { text: "Collection Management", icon: <AssessmentIcon />, path: "/collection-management", keywords: ["collection", "management", "manage", "overview"] },
      ],
    },

    { text: "Financial Report", icon: <AccountBalanceWalletIcon />, path: "/financial-reporting", keywords: ["financial", "report", "finance"] }, // Fixed keywords
    
    { text: "User Management", icon: <PeopleIcon />, path: "/user-management", keywords: ["user", "management", "users"] }, // Fixed keywords
    
    { text: "Security Management", icon: <SecurityIcon />, path: "/security-management", keywords: ["security", "management"] }, // Fixed keywords

    { text: "Settings", icon: <SettingsIcon />, path: "/settings", keywords: ["settings", "configuration", "preferences"] },
  ];

  // Flatten all menu items for search
  const allMenuItems = menuItems.flatMap(item =>
    item.children ? [item, ...item.children] : [item]
  );

  // 🔍 Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedResultIndex(-1);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filteredResults = allMenuItems.filter(item => {
      const searchableText = `${item.text} ${item.keywords ? item.keywords.join(" ") : ""}`.toLowerCase();
      return searchableText.includes(query.toLowerCase());
    });

    setSearchResults(filteredResults);
    setShowSearchResults(true);
  };

  const handleSearchItemClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
    setSelectedResultIndex(-1);
  };

  const handleClickAway = () => {
    setShowSearchResults(false);
    setSelectedResultIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedResultIndex(prev => prev < searchResults.length - 1 ? prev + 1 : 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedResultIndex(prev => prev > 0 ? prev - 1 : searchResults.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedResultIndex >= 0 && selectedResultIndex < searchResults.length) {
          handleSearchItemClick(searchResults[selectedResultIndex].path);
        }
        break;
      case "Escape":
        setShowSearchResults(false);
        setSelectedResultIndex(-1);
        break;
      default:
        break;
    }
  };

  // 🔁 Keep correct dropdown open on page load or route change
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (sub) => location.pathname === sub.path
        );
        if (isChildActive) {
          setOpenDropdowns((prev) => ({
            ...prev,
            [item.key]: true,
          }));
        }
      }
    });
  }, [location.pathname]);

  // 🎯 Scroll selected search item into view
  useEffect(() => {
    if (selectedResultIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedResultIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedResultIndex]);

  // 🧹 Handle Escape key for closing search
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowSearchResults(false);
        setSelectedResultIndex(-1);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Check if current path matches any menu item for highlighting
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const isChildActive = (children) => {
    return children.some(child => isActivePath(child.path));
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f6fa", minHeight: "100vh" }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : collapsedWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #eee",
            bgcolor: "#ffffff",
            color: "#333",
            overflowX: "hidden",
            transition: "width 0.3s ease",
            p: 2,
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            textAlign: "center",
            color: "#222",
            display: open ? "block" : "none",
          }}
        >
          <span style={{ color: "#D32F2F" }}>Palengke</span>Pro.PH
        </Typography>

        {!open && (
          <Box
            sx={{
              textAlign: "center",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#D32F2F",
              mb: 3,
            }}
          >
            P
          </Box>
        )}

        {/* Sidebar Menu Items */}
        <List>
          {menuItems.map((item, index) => {
            if (item.children) {
              const parentActive = isChildActive(item.children);
              const isDropdownOpen = openDropdowns[item.key];

              return (
                <Box key={index}>
                  <ListItem
                    button
                    onClick={() => handleDropdownToggle(item.key)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      px: open ? 2 : 1.5,
                      color: parentActive ? "#D32F2F" : "#333",
                      bgcolor: parentActive ? "#fdecea" : "transparent",
                      "&:hover": { bgcolor: "#f8f8f8", color: "#D32F2F" },
                      transition: "all 0.2s",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: parentActive ? "#D32F2F" : "#555",
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && (
                      <>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        />
                        {isDropdownOpen ? <ExpandLess /> : <ExpandMore />}
                      </>
                    )}
                  </ListItem>

                  <Collapse in={isDropdownOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((sub, i) => {
                        const isActive = isActivePath(sub.path);
                        return (
                          <ListItem
                            key={i}
                            component={Link}
                            to={sub.path}
                            sx={{
                              pl: open ? 6 : 2,
                              borderRadius: 2,
                              mb: 0.3,
                              color: isActive ? "#D32F2F" : "#444",
                              bgcolor: isActive ? "#fdecea" : "transparent",
                              "&:hover": { bgcolor: "#f9f9f9", color: "#D32F2F" },
                              transition: "all 0.2s",
                              textDecoration: 'none',
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                color: isActive ? "#D32F2F" : "#666",
                                minWidth: 0,
                                mr: open ? 2 : "auto",
                                justifyContent: "center",
                              }}
                            >
                              {sub.icon}
                            </ListItemIcon>
                            {open && (
                              <ListItemText
                                primary={sub.text}
                                primaryTypographyProps={{
                                  fontSize: 14,
                                  fontWeight: isActive ? 600 : 500,
                                }}
                              />
                            )}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            const isActive = isActivePath(item.path);
            return (
              <ListItem
                key={index}
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: open ? 2 : 1.5,
                  color: isActive ? "#D32F2F" : "#333",
                  bgcolor: isActive ? "#fdecea" : "transparent",
                  "&:hover": { bgcolor: "#f8f8f8", color: "#D32F2F" },
                  transition: "all 0.2s",
                  textDecoration: 'none',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? "#D32F2F" : "#555",
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 15,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Topbar */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "#fff",
            color: "#333",
            borderBottom: "1px solid #eee",
            px: 2,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>

              {/* 🔍 Search Bar */}
              <ClickAwayListener onClickAway={handleClickAway}>
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "#f5f5f5",
                      borderRadius: 2,
                      px: 2,
                      width: 300,
                    }}
                  >
                    <SearchIcon sx={{ color: "#777", mr: 1 }} />
                    <InputBase
                      ref={searchInputRef}
                      placeholder="Search pages..."
                      sx={{ fontSize: 14 }}
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onFocus={() => searchQuery && setShowSearchResults(true)}
                      onKeyDown={handleKeyDown}
                    />
                  </Box>

                  {/* Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <Paper
                      ref={resultsRef}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        mt: 1,
                        bgcolor: "white",
                        borderRadius: 2,
                        boxShadow: 3,
                        zIndex: 9999,
                        maxHeight: 300,
                        overflow: "auto",
                      }}
                    >
                      <List>
                        {searchResults.map((item, index) => (
                          <ListItemButton
                            key={index}
                            onClick={() => handleSearchItemClick(item.path)}
                            sx={{
                              px: 2,
                              py: 1,
                              bgcolor: selectedResultIndex === index ? "#fdecea" : "transparent",
                              color: selectedResultIndex === index ? "#D32F2F" : "inherit",
                              "&:hover": {
                                bgcolor: selectedResultIndex === index ? "#fdecea" : "#f5f5f5",
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={item.text}
                              primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: selectedResultIndex === index ? 600 : 500,
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </List>
                    </Paper>
                  )}

                  {/* No results */}
                  {showSearchResults && searchQuery && searchResults.length === 0 && (
                    <Paper
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        mt: 1,
                        bgcolor: "white",
                        borderRadius: 2,
                        boxShadow: 3,
                        zIndex: 9999,
                        p: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" align="center">
                        No pages found for "{searchQuery}"
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </ClickAwayListener>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tooltip title="Profile">
                <Avatar sx={{ bgcolor: "#D32F2F" }}>
                  <AccountCircleIcon />
                </Avatar>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
};