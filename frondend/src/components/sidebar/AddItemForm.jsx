import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoShare } from "react-icons/io5";
import {FaTrash, FaTimes, FaAngleDown, FaBars } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import SubAdminSideBar from "./SubAdminSideBar";
import { getLevel1And2Categories, uploadImage,} from "../../services/menu-cerate&update/categories/create-category.service";
import {getMenuItem,getMenuItems,createMenuItem,updateMenuItem,deleteMenuItem} from "../../services/menu-cerate&update/menu-items.service";
import { useAlertStore } from "../../context/alertStore";
import "../../assets/css/AddItemForm.css";
import "../../assets/css/SubAdminEditMenu.css";

function AddItemForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("id");
  const isEditMode = Boolean(itemId);

  // Form inputs state
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [category, setCategory] = useState("None");
  const [servingTime, setServingTime] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // Images list: elements of { id, imageUrl, isThumbnail, file }
  const [imagesList, setImagesList] = useState([]);

  // Visibility state for conditional sections
  const [showVariations, setShowVariations] = useState(false);
  const [showCustomizations, setShowCustomizations] = useState(false);
  const [showAddons, setShowAddons] = useState(false);

  // Dropdowns and select options
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);

  // Data lists for variations, customizations, addons
  const [variations, setVariations] = useState([]);
  const [customizations, setCustomizations] = useState([]);
  const [addons, setAddons] = useState([]);

  // Addon search selection
  const [availableItems, setAvailableItems] = useState([]);
  const [addonSearch, setAddonSearch] = useState("");
  const [showAddonDropdown, setShowAddonDropdown] = useState(false);

  // Page state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs
  const coverImageRef = useRef(null);
  const additionalImageRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const addonDropdownRef = useRef(null);

  // Initialize lists and fetch menu item details (for Edit mode) on mount
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        // 1. Fetch categories for dropdown
        const cats = await getLevel1And2Categories();
        setParentOptions(cats);

        // 2. Fetch all menu items for addon list
        const allItems = await getMenuItems();
        setAvailableItems(allItems);

        // 3. Load item details if in Edit Mode
        if (isEditMode) {
          const item = await getMenuItem(itemId);
          if (item) {
            setItemName(item.name);
            setItemDescription(item.description || "");
            setBasePrice(item.basePrice?.toString() || "");
            setDiscountedPrice(item.discountedPrice?.toString() || "");
            setCategory(item.categoryId?.toString() || "None");

            // Map images
            const formattedImages = (item.images || []).map((img) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              isThumbnail: img.isThumbnail,
              file: null,
            }));
            setImagesList(formattedImages);

            // Variations
            if (item.variations && item.variations.length > 0) {
              setVariations(
                item.variations.map((v) => ({
                  id: v.id,
                  name: v.name,
                  price: v.price?.toString(),
                })),
              );
              setShowVariations(true);
            }

            // Customizations
            if (item.customizations && item.customizations.length > 0) {
              setCustomizations(
                item.customizations.map((c) => ({
                  id: c.id,
                  name: c.name,
                  price: c.price?.toString(),
                  multiSelect: c.multiSelect,
                })),
              );
              setShowCustomizations(true);
            }

            // Addons
            if (item.addons && item.addons.length > 0) {
              setAddons(
                item.addons.map((a) => ({
                  id: a.addonId,
                  name: a.addonItem?.name || "Unknown Item",
                })),
              );
              setShowAddons(true);
            }
          } else {
            useAlertStore.getState().showAlert("Menu item not found.");
            navigate("/subadmin/edit-menu?tab=allItems");
          }
        }
      } catch (err) {
        useAlertStore
          .getState()
          .showAlert(err.message || "Failed to load menu item details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [itemId, isEditMode, navigate]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        addonDropdownRef.current &&
        !addonDropdownRef.current.contains(event.target)
      ) {
        setShowAddonDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Derived variation state & price reset logic
  const hasVariations = showVariations && variations.length > 0;
  const prevHasVariationsRef = useRef(hasVariations);

  useEffect(() => {
    if (!prevHasVariationsRef.current && hasVariations) {
      setBasePrice("0");
      setDiscountedPrice("0");
    } else if (prevHasVariationsRef.current && !hasVariations) {
      setBasePrice("");
      setDiscountedPrice("");
    }
    prevHasVariationsRef.current = hasVariations;
  }, [hasVariations]);

  // Images operations
  const handleCoverImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagesList((prev) => [
        ...prev.filter((img) => !img.isThumbnail),
        {
          id: Date.now(),
          imageUrl: URL.createObjectURL(file),
          isThumbnail: true,
          file,
        },
      ]);
    }
  };

  const handleAdditionalImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImagesList((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          imageUrl: URL.createObjectURL(file),
          isThumbnail: false,
          file,
        },
      ]);
    }
  };

  const handleRemoveImage = (id) => {
    setImagesList((prev) => prev.filter((img) => img.id !== id));
  };

  // Variations operations
  const handleAddVariation = () => {
    const newId =
      variations.length > 0 ? Math.max(...variations.map((v) => v.id)) + 1 : 1;
    setVariations([...variations, { id: newId, name: "", price: "" }]);
  };

  const handleVariationChange = (id, field, value) => {
    setVariations(
      variations.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const handleRemoveVariation = (id) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  // Customizations operations
  const handleAddCustomization = () => {
    const newId =
      customizations.length > 0
        ? Math.max(...customizations.map((c) => c.id)) + 1
        : 1;
    setCustomizations([
      ...customizations,
      { id: newId, name: "", price: "", multiSelect: false },
    ]);
  };

  const handleCustomizationChange = (id, field, value) => {
    setCustomizations(
      customizations.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const handleRemoveCustomization = (id) => {
    setCustomizations(customizations.filter((c) => c.id !== id));
  };

  // Addons operations
  const handleSelectAddon = (item) => {
    setAddons([...addons, { id: item.id, name: item.name }]);
    setAddonSearch("");
    setShowAddonDropdown(false);
  };

  const handleRemoveAddon = (id) => {
    setAddons(addons.filter((a) => a.id !== id));
  };

  // Toggle blocks
  const toggleVariations = () => {
    if (showVariations) {
      setVariations([]);
    }
    setShowVariations(!showVariations);
  };
  const toggleCustomizations = () => setShowCustomizations(!showCustomizations);
  const toggleAddons = () => setShowAddons(!showAddons);

  // Single item deletion
  const handleDeleteItem = async () => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      setSubmitting(true);
      try {
        const res = await deleteMenuItem(itemId);
        if (res?.success) {
          useAlertStore
            .getState()
            .showAlert(res.message || "Menu item deleted successfully.");
          navigate("/subadmin/edit-menu?tab=allItems");
        }
      } catch (err) {
        useAlertStore
          .getState()
          .showAlert(err.message || "Failed to delete item.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    const trimmedName = itemName.trim();
    if (!trimmedName) {
      useAlertStore.getState().showAlert("Please enter an item name.");
      return;
    }

    if (!hasVariations) {
      if (
        !discountedPrice.trim() ||
        isNaN(parseFloat(discountedPrice)) ||
        parseFloat(discountedPrice) < 0
      ) {
        useAlertStore
          .getState()
          .showAlert("discountedPrice is required.");
        return;
      }

      if (
        basePrice.trim() &&
        (isNaN(parseFloat(basePrice)) || parseFloat(basePrice) < 0)
      ) {
        useAlertStore.getState().showAlert("Please enter a valid base price.");
        return;
      }
    }

    if (category === "None" || !category) {
      useAlertStore.getState().showAlert("Please select a category.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload all unsaved image files
      const finalImages = [];
      for (const img of imagesList) {
        if (img.file) {
          const uploadRes = await uploadImage(img.file);
          if (uploadRes?.imageUrl) {
            finalImages.push({
              imageUrl: uploadRes.imageUrl,
              isThumbnail: img.isThumbnail,
            });
          } else {
            throw new Error("Failed to upload image file.");
          }
        } else {
          finalImages.push({
            imageUrl: img.imageUrl,
            isThumbnail: img.isThumbnail,
          });
        }
      }

      // Extract values
      const valBasePrice = hasVariations
        ? 0
        : basePrice.trim()
        ? parseFloat(basePrice)
        : undefined;
      const valDiscountedPrice = hasVariations
        ? 0
        : parseFloat(discountedPrice);
      const computedVariations = showVariations
        ? variations
          .filter((v) => v.name.trim() && !isNaN(parseFloat(v.price)))
          .map((v) => ({ name: v.name, price: parseFloat(v.price) }))
        : [];
      const computedCustomizations = showCustomizations
        ? customizations
          .filter((c) => c.name.trim() && !isNaN(parseFloat(c.price)))
          .map((c) => ({
            name: c.name,
            price: parseFloat(c.price),
            multiSelect: !!c.multiSelect,
          }))
        : [];
      const computedAddons = showAddons
        ? addons.map((a) => ({ addonId: parseInt(a.id, 10) }))
        : [];

      if (isEditMode) {
        // Update mutation
        await updateMenuItem({
          itemId: parseInt(itemId, 10),
          categoryId: parseInt(category, 10),
          name: trimmedName,
          description: itemDescription || undefined,
          basePrice: valBasePrice,
          discountedPrice: valDiscountedPrice,
          images: finalImages,
          variations: computedVariations,
          customizations: computedCustomizations,
          addons: computedAddons,
          imagesChanged: true,
          variationsChanged: true,
          customizationsChanged: true,
          addonsChanged: true,
        });
        useAlertStore.getState().showAlert("Menu item updated successfully!");
      } else {
        // Create mutation
        await createMenuItem({
          categoryId: parseInt(category, 10),
          name: trimmedName,
          description: itemDescription || undefined,
          basePrice: valBasePrice,
          discountedPrice: valDiscountedPrice,
          images: finalImages,
          variations: computedVariations,
          customizations: computedCustomizations,
          addons: computedAddons,
        });
        useAlertStore.getState().showAlert("Menu item created successfully!");
      }
      navigate("/subadmin/edit-menu?tab=allItems");
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to save menu item.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter categories to identify Selected Category Name
  const categoryNodeName =
    parentOptions.find((p) => p.id.toString() === category)?.name ||
    "Select Category";

  // Filter addons to avoid self or already selected
  const filteredAddonItems = availableItems.filter((item) => {
    if (isEditMode && item.id.toString() === itemId.toString()) return false;
    return !addons.some((a) => a.id.toString() === item.id.toString());
  });

  const coverImage = imagesList.find((img) => img.isThumbnail)?.imageUrl;
  const additionalImages = imagesList.filter((img) => !img.isThumbnail);

  return (
    <div className="dashboard d-flex">
      {/* Sidebar */}
      <SubAdminSideBar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Mobile Toggle */}
      <button
        className={`menu-toggle ${isMobileOpen ? "hidden" : ""}`}
        onClick={() => setIsMobileOpen(true)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* Main Content */}
      <div className="main-content">
        <div className="add-item-container" style={{ margin: "20px 0" }}>
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              Loading menu item details...
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="form-header">
                <h3 className="form-title">
                  {isEditMode ? "Update Menu Item" : "Add Menu Item"}
                </h3>
              </div>

              {/* Section 1: General Info & Images */}
              <div className="form-sections-wrapper">
                {/* Left Section - Inputs */}
                <div className="form-left-section">
                  <h3 className="section-title">
                    General Information{" "}
                    <span style={{ color: "#da3c3cff" }}>*</span>
                  </h3>
                  <div className="form-content">
                    <div className="form-group">
                      <label>Item Name</label>
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Fried egg"
                        disabled={submitting}
                      />
                    </div>
                    <div className="form-group">
                      <label>Item Description (Optional)</label>
                      <textarea
                        rows="4"
                        value={itemDescription}
                        onChange={(e) => setItemDescription(e.target.value)}
                        placeholder="Enter item description..."
                        disabled={submitting}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Right Section - Cover Image upload */}
                <div className="form-right-section">
                  <div className="form-content">
                    <div className="form-group">
                      <label className="centered-label">
                        Cover Image{" "}
                        <span style={{ color: "#da3c3cff" }}>*</span>
                      </label>
                      <div
                        className="image-upload-box"
                        onClick={() =>
                          !submitting && coverImageRef.current?.click()
                        }
                        style={{
                          cursor: submitting ? "not-allowed" : "pointer",
                          position: "relative",
                        }}
                      >
                        {coverImage ? (
                          <>
                            <img
                              src={coverImage}
                              alt="Cover"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "15px",
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImagesList((prev) =>
                                  prev.filter((img) => !img.isThumbnail),
                                );
                              }}
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                backgroundColor: "#ffffff",
                                border: "none",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ef4444",
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
                                zIndex: 10,
                              }}
                              disabled={submitting}
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : (
                          <>
                            <span>
                              <IoShare />
                            </span>
                            <p style={{ color: "black" }}>
                              Image size (400 x 400)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={coverImageRef}
                        onChange={handleCoverImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={submitting}
                      />
                    </div>

                    <div className="additional-images-container">
                      {additionalImages.map((img) => (
                        <div key={img.id} className="additional-image-item">
                          <img
                            src={img.imageUrl}
                            alt="Additional"
                            className="additional-image"
                          />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImage(img.id)}
                            disabled={submitting}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      ))}
                      <div
                        className="add-image-box"
                        onClick={() =>
                          !submitting && additionalImageRef.current?.click()
                        }
                        style={{
                          cursor: submitting ? "not-allowed" : "pointer",
                        }}
                      >
                        <IoMdAdd />
                      </div>
                      <input
                        type="file"
                        ref={additionalImageRef}
                        onChange={handleAdditionalImageChange}
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Pricing & Categories */}
              <div className="form-sections-wrapper">
                <div className="form-left-section">
                  <div className="form-content">
                    <h3 className="section-title">
                      Additional Information{" "}
                      <span style={{ color: "#da3c3cff" }}>*</span>
                    </h3>
                    <div className="form-group">
                      <label>Base Price (Optional)</label>
                      <div className="price-input">
                        <span className="currency">Rs.</span>
                        <input
                          type="text"
                          value={basePrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                              setBasePrice(val);
                            }
                          }}
                          placeholder="3000"
                          disabled={hasVariations || submitting}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>
                        Discounted Price{" "}
                        {!hasVariations ? (
                          <span style={{ color: "#da3c3cff" }}>*</span>
                        ) : (
                          "(Optional)"
                        )}
                      </label>
                      <div className="price-input">
                        <span className="currency">Rs.</span>
                        <input
                          type="text"
                          value={discountedPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                              setDiscountedPrice(val);
                            }
                          }}
                          placeholder="2399"
                          disabled={hasVariations || submitting}
                        />
                      </div>
                    </div>
                    {hasVariations && (
                      <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "-5px", marginBottom: "15px" }}>
                        Pricing is set per variation — item-level price is disabled
                      </p>
                    )}
                    <div className="form-group">
                      <label>Category</label>
                      <div
                        className="custom-dropdown"
                        ref={categoryDropdownRef}
                      >
                        <div
                          className="dropdown-selected"
                          onClick={() =>
                            !submitting &&
                            setShowCategoryDropdown(!showCategoryDropdown)
                          }
                          style={{
                            cursor: submitting ? "not-allowed" : "pointer",
                          }}
                        >
                          <span>{categoryNodeName}</span>
                          <FaAngleDown
                            className={
                              showCategoryDropdown ? "rotate-arrow" : ""
                            }
                          />
                        </div>
                        {showCategoryDropdown && (
                          <div className="dropdown-options">
                            {parentOptions.map((opt) => (
                              <div
                                key={opt.id}
                                className="dropdown-option"
                                onClick={() => {
                                  setCategory(opt.id.toString());
                                  setShowCategoryDropdown(false);
                                }}
                              >
                                {opt.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-right-section">
                  <div className="form-content">
                    <h3 className="section-title">Add Video (Optional)</h3>
                    <div className="video-upload-box">
                      <div className="video-upload-placeholder">
                        {/* <span>
                          <IoShare />
                        </span> */}
                        <p style={{ color: "black" }}>Coming Soon...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Variations */}
              {showVariations && (
                <div className="conditional-section">
                  <div className="section-header">
                    <h3 className="section-title">
                      Variations (Serving Sizes)
                    </h3>
                    <button
                      type="button"
                      className="collapse-btn"
                      onClick={toggleVariations}
                      disabled={submitting}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="section-content">
                    {variations.map((variation) => (
                      <div key={variation.id} className="variation-row">
                        <div
                          className="form-group"
                          style={{ flex: "0.8", marginBottom: "10px" }}
                        >
                          <input
                            type="text"
                            value={variation.name}
                            onChange={(e) =>
                              handleVariationChange(
                                variation.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="Size name (e.g. Large)"
                            disabled={submitting}
                          />
                        </div>
                        <div
                          className="form-group price-input-group"
                          style={{ flex: "0.2", marginBottom: "10px" }}
                        >
                          <span className="currency">Rs.</span>
                          <input
                            type="text"
                            value={variation.price}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                handleVariationChange(
                                  variation.id,
                                  "price",
                                  val,
                                );
                              }
                            }}
                            placeholder="Price"
                            disabled={submitting}
                          />
                        </div>
                        <div
                          className="variation-actions"
                          style={{ marginBottom: "10px" }}
                        >
                          <button
                            type="button"
                            className="remove-variation-btn"
                            onClick={() => handleRemoveVariation(variation.id)}
                            disabled={submitting}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="conditional-section-footer">
                    <button
                      type="button"
                      className="add-option-btn"
                      onClick={handleAddVariation}
                      disabled={submitting}
                    >
                      Add Option +
                    </button>
                  </div>
                </div>
              )}

              {/* Section 4: Customizations */}
              {showCustomizations && (
                <div className="conditional-section">
                  <div className="section-header">
                    <h3 className="section-title">Customizations (Toppings)</h3>
                    <button
                      type="button"
                      className="collapse-btn"
                      onClick={toggleCustomizations}
                      disabled={submitting}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="section-content">
                    {customizations.map((customization) => (
                      <div key={customization.id} className="variation-row">
                        <div
                          className="form-group"
                          style={{ flex: "0.8", marginBottom: "10px" }}
                        >
                          <input
                            type="text"
                            value={customization.name}
                            onChange={(e) =>
                              handleCustomizationChange(
                                customization.id,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="Option name (e.g. Extra Cheese)"
                            disabled={submitting}
                          />
                        </div>
                        <div
                          className="form-group price-input-group"
                          style={{ flex: "0.2", marginBottom: "10px" }}
                        >
                          <span className="currency">Rs.</span>
                          <input
                            type="text"
                            value={customization.price}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
                                handleCustomizationChange(
                                  customization.id,
                                  "price",
                                  val,
                                );
                              }
                            }}
                            placeholder="Price"
                            disabled={submitting}
                          />
                        </div>
                        <div
                          className="variation-actions"
                          style={{ marginBottom: "10px" }}
                        >
                          <button
                            type="button"
                            className="remove-variation-btn"
                            onClick={() =>
                              handleRemoveCustomization(customization.id)
                            }
                            disabled={submitting}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="conditional-section-footer">
                    <button
                      type="button"
                      className="add-option-btn"
                      onClick={handleAddCustomization}
                      disabled={submitting}
                    >
                      Add Option +
                    </button>
                  </div>
                </div>
              )}

              {/* Section 5: Addons */}
              {showAddons && (
                <div className="conditional-section">
                  <div className="section-header">
                    <h3 className="section-title">Add Addons</h3>
                    <button
                      type="button"
                      className="collapse-btn"
                      onClick={toggleAddons}
                      disabled={submitting}
                    >
                      <FaTimes />
                    </button>
                  </div>
                  <div className="section-content">
                    <div
                      className="form-group"
                      ref={addonDropdownRef}
                      style={{ position: "relative" }}
                    >
                      <label>Select Addon Items</label>
                      <div className="custom-dropdown">
                        <div
                          className="dropdown-selected"
                          onClick={() =>
                            !submitting &&
                            setShowAddonDropdown(!showAddonDropdown)
                          }
                          style={{
                            cursor: submitting ? "not-allowed" : "pointer",
                          }}
                        >
                          <span>Select Addon Item (Choose an existing menu item)</span>
                          <FaAngleDown
                            className={showAddonDropdown ? "rotate-arrow" : ""}
                          />
                        </div>
                        {showAddonDropdown && (
                          <div className="dropdown-options">
                            {filteredAddonItems.length > 0 ? (
                              filteredAddonItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="dropdown-option"
                                  onClick={() => {
                                    handleSelectAddon(item);
                                    setShowAddonDropdown(false);
                                  }}
                                >
                                  {item.name}
                                </div>
                              ))
                            ) : (
                              <div
                                className="dropdown-option"
                                style={{ color: "#888", cursor: "default" }}
                              >
                                No items available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="selected-addons">
                      {addons.map((addon) => (
                        <div key={addon.id} className="selected-addon">
                          <span>{addon.name}</span>
                          <button
                            type="button"
                            className="remove-addon"
                            onClick={() => handleRemoveAddon(addon.id)}
                            disabled={submitting}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action / Footer Buttons */}
              <div
                className="form-footer"
                style={{
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-start",
                }}
              >
                {!showVariations && (
                  <button
                    type="button"
                    className="action-btn"
                    onClick={toggleVariations}
                    disabled={submitting}
                  >
                    Add Variations +
                  </button>
                )}
                {!showCustomizations && (
                  <button
                    type="button"
                    className="action-btn"
                    onClick={toggleCustomizations}
                    disabled={submitting}
                  >
                    Add Customizations +
                  </button>
                )}
                {!showAddons && (
                  <button
                    type="button"
                    className="action-btn"
                    onClick={toggleAddons}
                    disabled={submitting}
                  >
                    Add Addons +
                  </button>
                )}

                <div
                  style={{ marginLeft: "auto", display: "flex", gap: "10px" }}
                >
                  <button
                    type="button"
                    className="add-category-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting
                      ? "Saving..."
                      : isEditMode
                        ? "Update Item"
                        : "Add Item"}
                  </button>
                  {isEditMode && (
                    <button
                      type="button"
                      className="delete-button"
                      style={{
                        backgroundColor: "#fecaca",
                        color: "#dc2626",
                        borderRadius: "1.5rem",
                        padding: "10px 20px",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        border: "none",
                        cursor: submitting ? "not-allowed" : "pointer",
                      }}
                      onClick={handleDeleteItem}
                      disabled={submitting}
                    >
                      Delete Item
                    </button>
                  )}
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => navigate("/subadmin/edit-menu?tab=allItems")}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddItemForm;
