import React, { useState, useEffect } from "react";
import { FaPenToSquare } from "react-icons/fa6";
import { IoMdAdd } from "react-icons/io";
import {
  FaTrash,
  FaPen,
  FaAngleDown,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaBars,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import SubAdminSideBar from "../../components/sidebar/SubAdminSideBar";
import "../../assets/css/SubAdminEditMenu.css";
import {
  getMenuCategoriesTree,
  performDeleteCategory,
} from "../../services/menu-cerate&update/categories/create-category.service";
import {
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
  deleteMenuItems,
} from "../../services/menu-cerate&update/menu-items.service";

import Confirm from "../../components/models/Confirm";
import { useAlertStore } from "../../context/alertStore";

function SubAdminEditMenu() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "allItems";
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [pendingItemDelete, setPendingItemDelete] = useState(null);

  // Client-side search filtering
  const filteredItems = items.filter((item) =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Check if all filtered items are selected
  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedIds.includes(item.id));

  // Handle select all toggle
  const handleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredItems.map((item) => item.id);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const filteredIds = filteredItems.map((item) => item.id);
      setSelectedIds((prev) => {
        const uniqueIds = new Set([...prev, ...filteredIds]);
        return Array.from(uniqueIds);
      });
    }
  };

  // Handle individual row selection
  const handleSelectRow = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  // Delete modal state
  // pendingDelete = { category, hasChildren }
  const [pendingDelete, setPendingDelete] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const tree = await getMenuCategoriesTree();
      setCategories(tree);
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to load categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoadingItems(true);
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to load menu items.");
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  // Function to navigate to AddCategoryPage
  const handleAddCategory = () => {
    navigate("/subadmin/add-category");
  };

  // Function to navigate to AddItemForm
  const handleAddItem = () => {
    navigate("/subadmin/add-item?addNewItem");
  };

  const handleEditItem = (item) => {
    navigate(`/subadmin/add-item?id=${item.id}`);
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const updated = await updateMenuItem({
        itemId: parseInt(itemId, 10),
        status: newStatus,
      });
      if (updated) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item,
          ),
        );
        useAlertStore
          .getState()
          .showAlert(`Item status updated to ${newStatus}.`);
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to update item status.");
    }
  };

  const handleDeleteItem = (itemId) => {
    setPendingItemDelete({ type: "single", ids: [itemId] });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      useAlertStore.getState().showAlert("No items selected.");
      return;
    }
    setPendingItemDelete({ type: "bulk", ids: selectedIds });
  };

  const handleConfirmItemDelete = async (confirmed) => {
    if (!confirmed || !pendingItemDelete) {
      setPendingItemDelete(null);
      return;
    }
    const { type, ids } = pendingItemDelete;
    setPendingItemDelete(null);
    try {
      if (type === "single") {
        const res = await deleteMenuItem(ids[0]);
        if (res?.success) {
          useAlertStore
            .getState()
            .showAlert(res.message || "Menu item deleted successfully.");
          fetchMenuItems();
        }
      } else if (type === "bulk") {
        const res = await deleteMenuItems(ids);
        if (res?.success) {
          useAlertStore
            .getState()
            .showAlert(
              res.message || "Selected menu items deleted successfully.",
            );
          setSelectedIds([]);
          fetchMenuItems();
          setShowBulkMenu(false);
        }
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to delete item(s).");
    }
  };

  const handleEditCategory = (category) => {
    navigate(`/subadmin/edit-category/${category.id}`);
  };

  // Open the appropriate confirmation modal.
  // hasChildren is derived from the local tree so no extra API call is needed.
  const handleDeleteCategoryClick = (category) => {
    const hasChildren = (category.children?.length ?? 0) > 0;
    setPendingDelete({ category, hasChildren });
  };

  // Called by <Confirm> when the user clicks Confirm or Cancel.
  const handleConfirmDelete = async (confirmed) => {
    if (!confirmed) {
      setPendingDelete(null);
      return;
    }
    const { category, hasChildren } = pendingDelete;
    setPendingDelete(null);
    try {
      const res = await performDeleteCategory(category.id, hasChildren);
      if (res?.success) {
        useAlertStore
          .getState()
          .showAlert(res.message || "Category deleted successfully!");
        fetchCategories();
      } else {
        useAlertStore
          .getState()
          .showAlert(res?.message || "Failed to delete category.");
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "An error occurred while deleting.");
    }
  };

  // Helper for category level backgrounds
  const getLevelBgColor = (level) => {
    if (level === 1) return "#F9F9F9";
    if (level === 2) return "#FFE7E7";
    if (level === 3) return "#F6EAFF";
    const colors = ["#E3F2FD", "#E8F5E9", "#FFF3E0", "#F3E5F5"];
    const colorIndex = (level - 4) % colors.length;
    return colors[colorIndex];
  };

  // Recursive Category Tree Renderer
  const renderCategoryTree = (
    nodes,
    parentName = "No Parent",
    indentLevel = 0,
  ) => {
    return nodes.map((node, index) => {
      const sequentialNumber = String(index + 1).padStart(2, "0");
      const isRoot = !node.parentCategoryId;
      const displayName = node.name;
      const hasChildren = node.children && node.children.length > 0;

      return (
        <React.Fragment key={node.id}>
          <div
            className="category-row"
            style={{
              marginLeft: `${indentLevel * 32}px`,
              paddingLeft: "25px",
              width: "auto",
              backgroundColor: getLevelBgColor(node.level),
              borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
              marginBottom: "5px",
            }}
          >
            <div className="category-info">
              <div className="category-id">{sequentialNumber}</div>
              {node.imageUrl ? (
                <img
                  src={node.imageUrl}
                  alt={node.name}
                  className="item-thumbnail"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    marginRight: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#e5e7eb",
                    marginRight: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    color: "#9ca3af",
                  }}
                >
                  No Img
                </div>
              )}
              <div
                className="category-name"
                style={{ display: "flex", alignItems: "center" }}
              >
                {displayName}
                {node.level > 1 && (
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "0.85em",
                      color: "#6b7280",
                      marginLeft: "15px",
                    }}
                  >
                    Sub
                  </span>
                )}
              </div>
            </div>
            <div className="category-details">
              <div
                className="parent-dropdown"
                style={{
                  backgroundColor:
                    node.level === 1
                      ? "#E3EFFE"
                      : node.level === 2
                        ? "#FFF5F5"
                        : node.level === 3
                          ? "#FDFAFF"
                          : "#E5E7EB",
                }}
              >
                <span>{isRoot ? "No Parent" : parentName}</span>
                <span className="dropdown-arrow">
                  <FaAngleDown />
                </span>
              </div>
              <div className="action-buttons">
                <button
                  className="edit-button"
                  onClick={() => handleEditCategory(node)}
                >
                  <FaPen />
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteCategoryClick(node)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>

          {hasChildren &&
            renderCategoryTree(node.children, node.name, indentLevel + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="dashboard d-flex">
      {/* Sidebar Component */}
      <SubAdminSideBar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Mobile Menu Toggle Button */}
      <button
        className={`menu-toggle ${isMobileOpen ? "hidden" : ""}`}
        onClick={() => setIsMobileOpen(true)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* Main Content */}
      <div className="main-content">
        <div className="header d-flex justify-content-between align-items-center mb-3">
          <h1 className="overview-title">Edit your menu</h1>
        </div>

        {/* Menu Tabs */}
        <div className="menu-tabs">
          <button
            className={`menu-tab-btn ${activeTab === "allItems" ? "active" : ""}`}
            onClick={() => setActiveTab("allItems")}
          >
            All Items
          </button>
          <button
            className={`menu-tab-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "categories" && (
          <>
            {loadingCategories ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                Loading categories tree...
              </div>
            ) : categories.length === 0 ? (
              // No categories exist - show empty state
              <div className="empty-categories-container">
                <p className="empty-categories-message">
                  Create categories to organize & list your menu items
                </p>
                <button
                  className="create-categories-btn"
                  onClick={handleAddCategory}
                >
                  Create Categories <FaPenToSquare />
                </button>
              </div>
            ) : (
              // Categories exist - show categories list
              <>
                {/* Add Category button - positioned above the container */}
                <div className="add-category-top-button-container">
                  <button
                    className="add-category-butttons"
                    onClick={handleAddCategory}
                  >
                    Add Category <IoMdAdd />
                  </button>
                </div>

                <div className="categories-container">
                  {/* Categories table header */}
                  <div className="categories-header">
                    <div className="categories-title">
                      Categories & Subcategories overview
                    </div>
                    <div className="categories-column-headers">
                      <div className="category-parent-header">Category</div>
                      <div className="actions-header">Actions</div>
                    </div>
                  </div>

                  {/* Categories list */}
                  <div className="categories-list">
                    {categories.map((category) => (
                      <div key={category.id} style={{ marginBottom: "10px" }}>
                        {renderCategoryTree([category])}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "allItems" && (
          <>
            {loadingItems ? (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                Loading menu items...
              </div>
            ) : items.length === 0 ? (
              // No items exist - show empty state
              <div className="empty-categories-container">
                <p className="empty-categories-message">
                  Add menu Items to your menu
                </p>
                <button
                  className="create-categories-btn"
                  onClick={handleAddItem}
                >
                  Add Menu Items <FaPenToSquare />
                </button>
              </div>
            ) : (
              // Items exist - show items list
              <>
                {/* Search, Bulk Menu, and Filter items moved outside the table area */}
                <div className="items-controls">
                  <div className="items-controls-left">
                    <div className="items-search">
                      <div className="search-input-container">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search menu items"
                          className="search-input"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <button
                        className="bulk-actions-btn"
                        onClick={() => setShowBulkMenu(!showBulkMenu)}
                      >
                        Bulk Actions <FaAngleDown />
                      </button>
                      {showBulkMenu && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            backgroundColor: "white",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            borderRadius: "15px",
                            zIndex: 10,
                            minWidth: "125px",
                            marginTop: "5px",
                          }}
                        >
                          <button
                            onClick={handleBulkDelete}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "10px 15px",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                              fontSize: "0.9rem",
                              color: "red",
                              fontWeight: "500",
                            }}
                          >
                            Delete Items
                          </button>
                        </div>
                      )}
                    </div>
                    <button className="filter-btn">
                      Filter Items <FaFilter className="filter-icon" />
                    </button>
                  </div>
                  <div className="items-controls-right">
                    <button
                      className="add-category-butttons"
                      onClick={handleAddItem}
                    >
                      Add New Item <IoMdAdd />
                    </button>
                  </div>
                </div>

                <div className="items-container">
                  {/* Items table */}
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th className="checkbox-column" style={{ width: "5%" }}>
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th className="sr-column" style={{ width: "5%" }}>
                          Sr
                        </th>
                        <th
                          className="item-name-column"
                          style={{ width: "40%" }}
                        >
                          Item Name
                        </th>
                        <th className="status-column" style={{ width: "20%" }}>
                          Status
                        </th>
                        <th
                          className="categories-column"
                          style={{ width: "20%" }}
                        >
                          Categories
                        </th>
                        <th className="actions-column" style={{ width: "10%" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, index) => (
                        <tr key={item.id}>
                          <td
                            className="checkbox-column"
                            style={{ width: "5%" }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => handleSelectRow(item.id)}
                            />
                          </td>
                          <td className="sr-column" style={{ width: "5%" }}>
                            {index + 1}
                          </td>
                          <td
                            className="item-name-column"
                            style={{ width: "40%" }}
                          >
                            <div className="item-info">
                              <span className="item-name">{item.name}</span>
                            </div>
                          </td>
                          <td
                            className="status-column"
                            style={{ width: "20%" }}
                          >
                            <select
                              className={`status-dropdown ${
                                (item.status || "Active") === "Active"
                                  ? "active"
                                  : "disabled"
                              }`}
                              value={item.status || "Active"}
                              onChange={(e) =>
                                handleStatusChange(item.id, e.target.value)
                              }
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                            <FaChevronDown className="active-status-icon" />
                          </td>
                          <td
                            className="categories-column"
                            style={{ width: "20%" }}
                          >
                            <span className="category-badge">
                              {item.category?.name || "None"}
                            </span>
                          </td>
                          <td
                            className="actions-column"
                            style={{ width: "10%" }}
                          >
                            <div className="item-actions">
                              <button
                                className="item-edit-btn"
                                onClick={() => handleEditItem(item)}
                              >
                                <FaPen />
                              </button>
                              <button
                                className="item-delete-btn"
                                style={{ color: "red" }}
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <FaTrash style={{ color: "red" }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal — message and button label adapt to hasChildren */}
      <Confirm
        show={Boolean(pendingDelete)}
        onClose={handleConfirmDelete}
        title="Delete Category?"
        message={
          pendingDelete?.hasChildren
            ? "This will delete the category, all its subcategories, and their related menu items. Are you sure you want to proceed?"
            : "This will delete this category and all its related menu items. Are you sure you want to proceed?"
        }
        confirmLabel="Delete"
      />
      <Confirm
        show={Boolean(pendingItemDelete)}
        onClose={handleConfirmItemDelete}
        title={
          pendingItemDelete?.type === "bulk"
            ? "Delete Selected Items?"
            : "Delete Menu Item?"
        }
        message={
          pendingItemDelete?.type === "bulk"
            ? `Are you sure you want to delete these ${pendingItemDelete.ids.length} selected items?`
            : "Are you sure you want to delete this menu item?"
        }
        confirmLabel="Delete"
      />
    </div>
  );
}

export default SubAdminEditMenu;
