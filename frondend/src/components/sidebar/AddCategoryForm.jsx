import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoShare } from "react-icons/io5";
import { FaBars } from "react-icons/fa";
import SubAdminSideBar from "./SubAdminSideBar";
import "../../assets/css/AddCategoryForm.css";
import "../../assets/css/SubAdminEditMenu.css"; // for dashboard styling classes
import {
  getLevel1And2Categories,
  getMenuCategoriesTree,
  createMenuCategory,
  updateMenuCategory,
  uploadImage,
} from "../../services/menu-cerate&update/categories/create-category.service";
import { useAlertStore } from "../../context/alertStore";

function AddCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [parentCategory, setParentCategory] = useState("None");
  const [parentOptions, setParentOptions] = useState([]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch parent categories and optional category details on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Level 1 & 2 categories
        const parents = await getLevel1And2Categories();
        setParentOptions(parents);

        // If in Edit Mode, fetch details from tree recursively
        if (isEditMode) {
          const tree = await getMenuCategoriesTree();
          const finder = (nodes) => {
            for (const node of nodes) {
              if (node.id.toString() === id) return node;
              if (node.children && node.children.length > 0) {
                const found = finder(node.children);
                if (found) return found;
              }
            }
            return null;
          };
          const categoryNode = finder(tree);
          if (categoryNode) {
            setCategoryName(categoryNode.name);
            setCategoryDescription(categoryNode.description || "");
            setSelectedImage(categoryNode.imageUrl);
            setParentCategory(
              categoryNode.parentCategoryId
                ? categoryNode.parentCategoryId.toString()
                : "None",
            );
          } else {
            useAlertStore.getState().showAlert("Category not found.");
            navigate("/subadmin/edit-menu?tab=categories");
          }
        }
      } catch (err) {
        useAlertStore
          .getState()
          .showAlert(err.message || "Failed to load form details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, navigate]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      useAlertStore.getState().showAlert("Please enter a category name");
      return;
    }

    if (!selectedImage) {
      useAlertStore.getState().showAlert("Please select a cover image");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = selectedImage;

      // 1. If user selected a new file, upload it first
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        if (uploadRes?.imageUrl) {
          imageUrl = uploadRes.imageUrl;
        } else {
          throw new Error("Failed to upload image.");
        }
      }

      // 2. Map parent category ID to parentCategoryName for backend DTO
      let parentCategoryName = undefined;
      if (parentCategory !== "None") {
        const parentNode = parentOptions.find(
          (p) => p.id.toString() === parentCategory,
        );
        if (parentNode) {
          parentCategoryName = parentNode.name;
        }
      }

      // 3. Create or Update category
      if (isEditMode) {
        const res = await updateMenuCategory({
          id: parseInt(id, 10),
          name: categoryName,
          imageUrl,
          description: categoryDescription || undefined,
          parentCategoryName: parentCategoryName || undefined,
        });
        if (res) {
          useAlertStore.getState().showAlert("Category updated successfully!");
          navigate("/subadmin/edit-menu?tab=categories");
        }
      } else {
        const res = await createMenuCategory({
          name: categoryName,
          imageUrl,
          description: categoryDescription || undefined,
          parentCategoryName: parentCategoryName || undefined,
        });
        if (res) {
          useAlertStore.getState().showAlert("Category created successfully!");
          navigate("/subadmin/edit-menu?tab=categories");
        }
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter parents to avoid setting self as parent in edit mode
  const filteredParentOptions = isEditMode
    ? parentOptions.filter((p) => p.id.toString() !== id)
    : parentOptions;

  return (
    <div className="dashboard d-flex">
      {/* Sidebar Component */}
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
        <div className="add-category-container" style={{ margin: "20px 0" }}>
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#666" }}
            >
              Loading category details...
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="form-header">
                <h3 className="form-title">
                  {isEditMode ? "Update Category" : "Add a category"}
                </h3>
              </div>

              {/* Form Sections */}
              <div className="form-sections-wrapper">
                {/* Left Section - Inputs */}
                <div className="form-left-section">
                  <div className="form-content">
                    <div className="form-group">
                      <label>Category Name</label>
                      <input
                        type="text"
                        placeholder="Enter category name"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                    <div className="form-group">
                      <label>Category Description (Optional)</label>
                      <textarea
                        rows="4"
                        placeholder="Enter category description"
                        value={categoryDescription}
                        onChange={(e) => setCategoryDescription(e.target.value)}
                        disabled={submitting}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Parent category</label>
                      <select
                        value={parentCategory}
                        onChange={(e) => setParentCategory(e.target.value)}
                        disabled={submitting}
                      >
                        <option value="None">None</option>
                        {filteredParentOptions.map((p) => (
                          <option key={p.id} value={p.id.toString()}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Section - Image Upload */}
                <div className="form-right-section">
                  <div className="form-content">
                    <div className="form-group">
                      <label className="centered-label">Add Cover Image</label>
                      <div
                        className="image-upload-box"
                        onClick={handleImageClick}
                        style={{
                          cursor: submitting ? "not-allowed" : "pointer",
                        }}
                      >
                        {selectedImage ? (
                          <img
                            src={selectedImage}
                            alt="Selected category"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "15px",
                            }}
                          />
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
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: "none" }}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="form-footer">
                <button
                  className="add-category-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : isEditMode
                      ? "Update Category"
                      : "Add Category"}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => navigate("/subadmin/edit-menu?tab=categories")}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddCategoryForm;
