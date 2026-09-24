import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../../assets/css/Waiter/WaiterOrderHistory.css";
import breakfastImg from "/images/breakfast.png";
import {
  fetchWaiterViewOrders,
  fetchShowMenuItemsDetails,
  updateOrderStatus,
} from "../../services/waiter/waiterOrder/waiterOrder.service";
import { useAlertStore } from "../../context/alertStore";
import {
  hasPermission,
  PERMISSION_CODES,
  PERMISSION_KEYS,
} from "../../utils/permissionUtils";

const OrderServings = () => {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Permission checks
  const hasViewOrdersPermission = useMemo(
    () =>
      hasPermission(
        PERMISSION_CODES.ORDERS_VIEW,
        PERMISSION_KEYS.ORDERS_VIEW
      ),
    []
  );

  const hasViewDetailsPermission = useMemo(
    () =>
      hasPermission(
        PERMISSION_CODES.ORDERS_VIEW_DETAILS,
        PERMISSION_KEYS.ORDERS_VIEW_DETAILS
      ),
    []
  );

  const hasEditPermission = useMemo(
    () =>
      hasPermission(
        PERMISSION_CODES.ORDERS_EDIT,
        PERMISSION_KEYS.ORDERS_EDIT
      ),
    []
  );

  // 1. Fetch Orders List (React Query)
  const {
    data: ordersList = [],
    isLoading: isLoadingOrders,
    isError: isErrorOrders,
    error: ordersError,
  } = useQuery({
    queryKey: ["waiter-view-orders"],
    queryFn: () =>
      fetchWaiterViewOrders({
        permissionKey: PERMISSION_KEYS.ORDERS_VIEW,
        permissionCode: PERMISSION_CODES.ORDERS_VIEW,
      }),
    enabled: hasViewOrdersPermission,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });

  // 2. Fetch Details for Expanded Order (React Query)
  const {
    data: orderItemsDetails = [],
    isLoading: isLoadingDetails,
    isError: isErrorDetails,
    error: detailsError,
  } = useQuery({
    queryKey: ["waiter-order-details", expandedOrderId],
    queryFn: () =>
      fetchShowMenuItemsDetails({
        permissionKey: PERMISSION_KEYS.ORDERS_VIEW_DETAILS,
        permissionCode: PERMISSION_CODES.ORDERS_VIEW_DETAILS,
        orderId: expandedOrderId,
      }),
    enabled: Boolean(expandedOrderId) && hasViewDetailsPermission,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 3. Update Order Status Mutation (React Query)
  const updateStatusMutation = useMutation({
    mutationFn: (orderId) =>
      updateOrderStatus({
        permissionKey: PERMISSION_KEYS.ORDERS_EDIT,
        permissionCode: PERMISSION_CODES.ORDERS_EDIT,
        orderId,
      }),
    onSuccess: (result) => {
      if (result === true) {
        showAlert("Orders update successfully");
        queryClient.invalidateQueries({ queryKey: ["waiter-view-orders"] });
      } else {
        showAlert("Failed to update order status.");
      }
    },
    onError: (err) => {
      showAlert(err.message || "An error occurred while updating order.");
    },
  });

  // Toggle order card expansion with permission check
  const toggleOrder = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }

    if (!hasViewDetailsPermission) {
      showAlert("You have not permission to perform this task");
      return;
    }

    setExpandedOrderId(orderId);
  };

  // Handle Confirmed / Done button click with permission check
  const handleConfirmOrder = (orderId, e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!hasEditPermission) {
      showAlert("You have not permission to perform this task");
      return;
    }

    updateStatusMutation.mutate(orderId);
  };

  // Format helpers
  const renderCustomization = (customizations) => {
    if (!customizations || !Array.isArray(customizations) || customizations.length === 0) {
      return "-";
    }
    return customizations
      .map((c) => {
        const name = c.name || c.itemCustomizationName || "";
        const price = c.price ? ` (${c.price} pkr)` : "";
        return `${name}${price}`.trim();
      })
      .filter(Boolean)
      .join(", ");
  };

  const renderVariation = (variations) => {
    if (!variations || !Array.isArray(variations) || variations.length === 0) {
      return "-";
    }
    return variations
      .map((v) => {
        const name = v.name || v.itemVariationName || "";
        const price = v.price ? ` (${v.price} pkr)` : "";
        return `${name}${price}`.trim();
      })
      .filter(Boolean)
      .join(", ");
  };

  // Surface orders list query error via Alert.jsx
  useEffect(() => {
    if (isErrorOrders && ordersError) {
      showAlert(
        ordersError?.message || "Your session has expired. Please login again."
      );
    }
  }, [isErrorOrders, ordersError, showAlert]);

  // Handle lack of view permission
  if (!hasViewOrdersPermission) {
    return (
      <div
        className="woh-orders-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "350px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
          NO Found
        </h2>
      </div>
    );
  }

  if (isLoadingOrders) {
    return (
      <div className="woh-orders-container" style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (isErrorOrders || !ordersList || ordersList.length === 0) {
    return (
      <div
        className="woh-orders-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "350px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
          NO Found
        </h2>
      </div>
    );
  }

  return (
    <div className="woh-orders-container">
      {ordersList.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const tableNo = order.table?.tableNumber ?? order.tableId ?? "N/A";
        const customerName = order.customer?.name || "Walk-in Customer";
        const orderDate = order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "N/A";
        const orderTime = order.createdAt
          ? new Date(order.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A";

        return (
          <div key={order.id} className="woh-order-card">
            <div className="woh-order-card-content">
              {/* Left Section: Circular Image */}
              <div className="woh-order-image-container">
                <div className="woh-order-image">
                  <img src={breakfastImg} alt="Order" />
                </div>
              </div>

              {/* Right Section: Content Area */}
              <div className="woh-order-content-area">
                {/* Row 1: Order ID and Done Button */}
                <div className="woh-content-row-1">
                  <div
                    className="woh-order-id"
                    onClick={() => toggleOrder(order.id)}
                  >
                    Order # {order.orderNumber || order.id}
                    {isExpanded ? (
                      <FaChevronUp className="woh-chevron" />
                    ) : (
                      <FaChevronDown className="woh-chevron" />
                    )}
                  </div>

                  <button
                    className="woh-done-btns"
                    disabled={updateStatusMutation.isPending}
                    onClick={(e) => handleConfirmOrder(order.id, e)}
                  >
                    {updateStatusMutation.isPending &&
                    updateStatusMutation.variables === order.id
                      ? "Updating..."
                      : "Done"}
                  </button>
                </div>

                {/* Row 2: Order Type and Table Info */}
                <div
                  className="woh-content-row-2"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="woh-order-info-left">
                    <span className="woh-order-type-badge">
                      {order.orderType || "DINE_IN"}
                    </span>
                    <span className="woh-order-type-badge" style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}>
                      {order.status || "PENDING"}
                    </span>
                    {order.orderType === "DINE_IN" || !order.orderType ? (
                      <span className="woh-table-badge">
                        Table # {tableNo}
                      </span>
                    ) : (
                      <span className="woh-table-badge">{customerName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {isExpanded && (
              <div className="woh-order-details">
                {isLoadingDetails ? (
                  <p style={{ padding: "1rem", textAlign: "center" }}>
                    Loading order details...
                  </p>
                ) : isErrorDetails ? (
                  <p style={{ padding: "1rem", color: "red", textAlign: "center" }}>
                    {detailsError?.message || "Failed to load order details."}
                  </p>
                ) : (
                  <>
                    {/* Items Table */}
                    <div className="woh-table-container">
                      <table className="woh-items-table">
                        <thead>
                          <tr>
                            <th>Sr</th>
                            <th>Item</th>
                            <th>Customization</th>
                            <th>Variation</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderItemsDetails && orderItemsDetails.length > 0 ? (
                            orderItemsDetails.map((item, index) => (
                              <tr key={item.id || index}>
                                <td>{index + 1}</td>
                                <td className="woh-cell-item-name">
                                  {item.menuItemName || item.name}
                                </td>
                                <td>{renderCustomization(item.customizations)}</td>
                                <td>{renderVariation(item.variations)}</td>
                                <td>
                                  {String(item.quantity).padStart(2, "0")}
                                </td>
                                <td>{item.unitPrice} pkr</td>
                                <td>{item.totalPrice} pkr</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" style={{ textAlign: "center" }}>
                                No items found in this order.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Total Summary */}
                    <div className="woh-total-summary">
                      <div className="woh-total-label">
                        <span className="woh-total-label-text">Total</span>
                      </div>
                      <div className="woh-total-amount">
                        RS. {order.total ? Number(order.total).toFixed(1) : "0.0"}
                      </div>
                    </div>

                    {/* Customer Info Single Row */}
                    <div className="woh-customer-info-single-row">
                      <span className="woh-info-badge">
                        <span className="woh-info-label">Name:</span>{" "}
                        {customerName}
                      </span>
                      <span className="woh-info-badge">
                        <span className="woh-info-label">Date:</span>{" "}
                        {orderDate}
                      </span>
                      <span className="woh-info-badge">
                        <span className="woh-info-label">Time:</span>{" "}
                        {orderTime}
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="woh-action-buttons-row">
                      <button
                        className="woh-action-btn woh-btn-add-items"
                        onClick={() =>
                          console.log(`Add Items to order ${order.id}`)
                        }
                      >
                        Add Items
                      </button>
                      <button
                        className="woh-action-btn woh-btn-confirmed"
                        disabled={updateStatusMutation.isPending}
                        onClick={() => handleConfirmOrder(order.id)}
                      >
                        {updateStatusMutation.isPending &&
                        updateStatusMutation.variables === order.id
                          ? "Updating..."
                          : "Confirmed"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderServings;
