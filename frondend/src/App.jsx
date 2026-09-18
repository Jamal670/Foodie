import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SubAdminDash from "./pages/subAdminRoutes/SubAdminDash";
import SubAdminEditMenu from "./pages/subAdminRoutes/SubAdminEditMenu";
import SubAdminOrderHistory from "./pages/subAdminRoutes/SubAdminOrderHistory";
import SubAdminCustomer from "./pages/subAdminRoutes/subAdminCustomer";
import SubAdminQRCode from "./pages/subAdminRoutes/SubAdminQRCode";
import SubAdminSetting from "./pages/subAdminRoutes/SubAdminSetting";

import CustMenu from "./pages/customer/CustMenu";
import CustMenuList from "./pages/customer/CustMenuList";
import CustMenuDetail from "./pages/customer/CustMenuDetail";
import CustEditMenuDetial from "./pages/customer/CustEditMenuDetial";
import CustCart from "./pages/customer/CustCart";
import CustOrder from "./pages/customer/CustOrder";
import CustOrderCompTimer from "./pages/customer/CustOrderCompTimer";

//Waiter
import WaiterOrderHistory from "./pages/Waiter/WaiterOrderHistory";
import WaiterOrderMenu from "./pages/Waiter/WaiterOrderMenu";

import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import ForgetPass from "./pages/auth/ForgetPass";
import VerifyEmail from "./pages/auth/verifyEmail";
import CreateNewFgtPassword from "./components/auth/fgtPass/CreateNewFgtPassword";

import Alert from "./components/common/Alert";
import { AuthProvider } from "./context/AuthContext";
import NavigationHandler from "./utils/NavigationHandler";
import AddCategoryForm from "./components/sidebar/AddCategoryForm";
import AddItemForm from "./components/sidebar/AddItemForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Alert />
        <BrowserRouter>
          <NavigationHandler />
          <Routes>
            <Route path="/" element={<SubAdminDash />} />
            <Route path="/subadmin/dashboard" element={<SubAdminDash />} />
            <Route path="/subadmin/edit-menu" element={<SubAdminEditMenu />} />
            <Route path="/subadmin/add-category" element={<AddCategoryForm />} />
            <Route
              path="/subadmin/edit-category/:id"
              element={<AddCategoryForm />}
            />
            <Route path="/subadmin/add-item" element={<AddItemForm />} />
            <Route
              path="/subadmin/order-history"
              element={<SubAdminOrderHistory />}
            />
            <Route path="/subadmin/customers" element={<SubAdminCustomer />} />
            <Route path="/subadmin/qr-code" element={<SubAdminQRCode />} />
            <Route path="/subadmin/setting" element={<SubAdminSetting />} />

            <Route path="/customer/menu/t/:qrToken" element={<CustMenu />} />
            <Route path="/customer/menu" element={<CustMenu />} />
            <Route
              path="/customer/menu-list/t/:qrToken/:categoryId"
              element={<CustMenuList />}
            />
            <Route path="/customer/menu-list/t/:qrToken" element={<CustMenuList />} />
            <Route path="/customer/menu-list" element={<CustMenuList />} />
            <Route
              path="/customer/menu-details/t/:qrToken/:menuItemId"
              element={<CustMenuDetail />}
            />
            <Route
              path="/customer/menu-details/t/:qrToken"
              element={<CustMenuDetail />}
            />
            <Route path="/customer/menu-details" element={<CustMenuDetail />} />
            <Route
              path="/customer/menu/edit/t/:qrToken/:menuItemId/:cartItemId"
              element={<CustEditMenuDetial />}
            />
            <Route
              path="/customer/menu/edit/:menuItemId/:cartItemId"
              element={<CustEditMenuDetial />}
            />
            <Route
              path="/customer/cart/t/:qrToken/:cartId"
              element={<CustCart />}
            />
            <Route path="/customer/cart/t/:qrToken" element={<CustCart />} />
            <Route path="/customer/cart" element={<CustCart />} />
            <Route
              path="/customer/menu-orders/t/:qrToken"
              element={<CustOrder />}
            />
            <Route path="/customer/menu-orders" element={<CustOrder />} />
            <Route
              path="/customer/order-timer/t/:qrToken/:orderId"
              element={<CustOrderCompTimer />}
            />
            <Route
              path="/customer/order-timer/:orderId"
              element={<CustOrderCompTimer />}
            />
            <Route
              path="/customer/order-timer/t/:qrToken"
              element={<CustOrderCompTimer />}
            />
            <Route
              path="/customer/order-timer"
              element={<CustOrderCompTimer />}
            />
            
            <Route
              path="/waiter/order-history"
              element={<WaiterOrderHistory />}
            />
            <Route
              path="/waiter/order-menu"
              element={<WaiterOrderMenu />}
            />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forget-pass" element={<ForgetPass />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/create-new-fgt-password"
              element={<CreateNewFgtPassword />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
