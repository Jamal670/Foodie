import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "../../assets/css/Customer/CustCart.css";
import { FaArrowLeft, FaTimes, FaCheck, FaArrowRight } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { fetchMyCart, deleteCartItem } from "../../services/customer/carts/cart.service";
import { useAlertStore } from "../../context/alertStore";
import {
  decrementCartCount,
  setCartCount,
  setCartId,
} from "../../utils/cartStorage";

const CustCart = () => {
  const navigate = useNavigate();
  const { qrToken } = useParams();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState("Card"); // "Card" | "Cash"
  const [orderPlaced, setOrderPlaced] = useState(false);

  // 1. Fetch Cart via React Query
  const {
    data: cartData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-cart"],
    queryFn: fetchMyCart,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Sync cartId and cartCount with localStorage whenever cartData updates
  useEffect(() => {
    if (cartData?.id) {
      setCartId(cartData.id);
    }
    if (cartData?.items) {
      setCartCount(cartData.items.length);
    }
  }, [cartData]);

  // Surface errors via Zustand alert store
  useEffect(() => {
    if (isError && error) {
      useAlertStore
        .getState()
        .showAlert(error.message || "Failed to load cart data.");
    }
  }, [isError, error]);

  // 2. Optimistic Delete Item Mutation with Automatic Rollback
  const deleteMutation = useMutation({
    mutationFn: (cartItemId) => deleteCartItem(cartItemId),
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: ["my-cart"] });
      const previousCart = queryClient.getQueryData(["my-cart"]);

      queryClient.setQueryData(["my-cart"], (old) => {
        if (!old || !old.items) return old;
        const updatedItems = old.items.filter((i) => i.id !== Number(cartItemId));
        return { ...old, items: updatedItems };
      });

      return { previousCart };
    },
    onError: (err, cartItemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["my-cart"], context.previousCart);
        if (context.previousCart.items) {
          setCartCount(context.previousCart.items.length);
        }
      }
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to remove item from cart.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-cart"] });
    },
  });

  const handleRemoveItem = (id) => {
    decrementCartCount(1);
    deleteMutation.mutate(id);
  };

  const handleEditCartItem = (item) => {
    const queryParams = new URLSearchParams();
    if (item.quantity) queryParams.set("quantity", item.quantity.toString());
    if (item.itemVariationName) queryParams.set("variationName", encodeURIComponent(item.itemVariationName));
    if (item.itemCustomizationName) queryParams.set("customizationName", encodeURIComponent(item.itemCustomizationName));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const targetPath = qrToken
      ? `/customer/menu/edit/t/${qrToken}/${item.menuItemId}/${item.id}${queryString}`
      : `/customer/menu/edit/${item.menuItemId}/${item.id}${queryString}`;

    navigate(targetPath, { state: { item } });
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      if (qrToken) {
        navigate(`/customer/menu-orders/t/${qrToken}`);
      } else {
        navigate("/customer/menu-orders");
      }
    }, 1800);
  };

  const cartItems = cartData?.items || [];

  // Total Calculations (Step 0.4: item.price represents line total)
  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );
  const taxRate = paymentMethod === "Card" ? 0.05 : 0.16;
  const taxAmount = itemsTotal * taxRate;
  const finalSubtotal = itemsTotal + taxAmount;
  const taxLabel = paymentMethod === "Card" ? "Card Tax (5%)" : "Cash Tax (16%)";

  return (
    <div className="cust-cart-page">
      <div className="cust-cart-card-container">
        {/* Header Section */}
        <div className="cust-cart-header">
          <button
            className="cart-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <IoIosArrowBack size={15} />
            <span>Back</span>
          </button>
          <h1 className="cart-header-title">My Cart</h1>
          <div></div>
        </div>

        {/* Main Content Layout */}
        <div className="cart-main-content-layout">
          {/* Left Column: Cart Items List */}
          <div className="cart-left-column">
            <div className="cart-items-list">
              {isLoading ? (
                <div className="text-center py-5">
                  <p style={{ color: "#666" }}>Loading your cart...</p>
                </div>
              ) : cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="cart-item-card"
                    onClick={() => handleEditCartItem(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="cart-item-main-row">
                      <img
                        src={item.image || "/images/scrambled_eggs.jpg"}
                        alt={item.menuItemName}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-center-info">
                        <div className="cart-item-top-header">
                          <h3 className="cart-item-name">{item.menuItemName}</h3>
                          <button
                            className="cart-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            aria-label="Remove item"
                            disabled={deleteMutation.isPending}
                          >
                            <FaTimes />
                          </button>
                        </div>

                        {/* Subtitle Details: Variation, Customization, Quantity + Price */}
                        <div className="cart-meta-details-list">
                          <div className="cart-meta-row-scroll">
                            <span className="cart-meta-label">Variation:</span>
                            <span className="cart-meta-value">
                              {item.itemVariationName || "Standard"}
                            </span>
                          </div>
                          <div className="cart-meta-row-scroll">
                            <span className="cart-meta-label">Customization:</span>
                            <span className="cart-meta-value">
                              {item.itemCustomizationName || "None"}
                            </span>
                          </div>

                          {/* Quantity row with line total price on the right side */}
                          <div className="cart-meta-quantity-price-row">
                            <div className="cart-meta-qty-group">
                              <span className="cart-meta-label">Quantity:</span>
                              <span className="cart-qty-val" style={{ marginLeft: "6px", fontWeight: 600 }}>
                                {item.quantity}
                              </span>
                            </div>
                            <span className="cart-item-small-price">
                              RS. {Number(item.price || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cart-empty-view text-center py-5">
                  <h2 style={{ color: "#333", marginBottom: "8px" }}>Oops!</h2>
                  <p style={{ color: "#666", marginBottom: "20px" }}>
                    Your cart is Empty.
                  </p>
                  <button
                    className="cart-browse-btn"
                    onClick={() => {
                      if (qrToken) {
                        navigate(`/customer/menu/t/${qrToken}`);
                      } else {
                        navigate(-1);
                      }
                    }}
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Summary & Payment Options */}

          <div className="cart-right-column">
            <div className="cart-sticky-checkout-container">
              {/* Paid By Section */}
              <div className="checkout-section-block">
                <h4 className="checkout-section-heading">Paid By</h4>
                <div className="payment-options-row">
                  <div
                    className={`payment-option-card ${paymentMethod === "Card" ? "selected" : ""
                      }`}
                    onClick={() => setPaymentMethod("Card")}
                  >
                    <div
                      className={`payment-radio ${paymentMethod === "Card" ? "checked" : ""
                        }`}
                    >
                      {paymentMethod === "Card" && (
                        <FaCheck className="radio-check-icon" />
                      )}
                    </div>
                    <span className="payment-label">Card (+5% Tax)</span>
                  </div>

                  <div
                    className={`payment-option-card ${paymentMethod === "Cash" ? "selected" : ""
                      }`}
                    onClick={() => setPaymentMethod("Cash")}
                  >
                    <div
                      className={`payment-radio ${paymentMethod === "Cash" ? "checked" : ""
                        }`}
                    >
                      {paymentMethod === "Cash" && (
                        <FaCheck className="radio-check-icon" />
                      )}
                    </div>
                    <span className="payment-label">Cash (+16% Tax)</span>
                  </div>
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="checkout-summary-list">
                {/* Total Row */}
                <div className="summary-row">
                  <span className="summary-label">Total</span>
                  <span className="summary-val">
                    Rs. {Math.round(itemsTotal).toLocaleString()}
                  </span>
                </div>

                {/* Tax Row */}
                <div className="summary-row">
                  <span className="summary-label">{taxLabel}</span>
                  <span className="summary-val">
                    Rs. {Math.round(taxAmount).toLocaleString()}
                  </span>
                </div>

                {/* Subtotal Row */}
                <div className="summary-row final-subtotal-row">
                  <span className="summary-label">Subtotal</span>
                  <span className="summary-val">
                    Rs. {Math.round(finalSubtotal).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Your Order Button */}
              <button
                className="place-order-main-btn"
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                style={{
                  opacity: cartItems.length === 0 ? 0.5 : 1,
                  cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                <span>Place Your Order</span>
                <FaArrowRight className="btn-arrow-icon" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustCart;
