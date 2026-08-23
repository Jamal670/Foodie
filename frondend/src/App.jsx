import { BrowserRouter, Routes, Route } from "react-router-dom";
import SubAdminDash from "./pages/subAdminRoutes/SubAdminDash";
import SubAdminEditMenu from "./pages/subAdminRoutes/SubAdminEditMenu";
import SubAdminOrderHistory from "./pages/subAdminRoutes/SubAdminOrderHistory";
import SubAdminCustomer from "./pages/subAdminRoutes/subAdminCustomer";
import SubAdminQRCode from "./pages/subAdminRoutes/SubAdminQRCode";
import SubAdminSetting from "./pages/subAdminRoutes/SubAdminSetting";

import CustMenu from "./pages/customer/CustMenu";
import CustMenuList from "./pages/customer/CustMenuList";
import CustMenuDetail from "./pages/customer/CustMenuDetail";
import CustOrder from "./pages/customer/CustOrder";

import WaiterOrderHistory from "./pages/Waiter/WaiterOrderHistory";

import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import ForgetPass from "./pages/auth/ForgetPass";
import VerifyEmail from "./pages/auth/verifyEmail";
import CreateNewFgtPassword from "./components/auth/fgtPass/CreateNewFgtPassword";

import Alert from "./components/common/alert";
import { AuthProvider } from "./context/AuthContext";
import NavigationHandler from "./utils/NavigationHandler";
import AddCategoryForm from "./components/sidebar/AddCategoryForm";
import AddItemForm from "./components/sidebar/AddItemForm";

function App() {
  return (
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

          <Route path="/customer/menu" element={<CustMenu />} />
          <Route path="/customer/menu-list" element={<CustMenuList />} />
          <Route path="/customer/menu-details" element={<CustMenuDetail />} />
          <Route path="/customer/menu-orders" element={<CustOrder />} />

          <Route
            path="/waiter/order-history"
            element={<WaiterOrderHistory />}
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
  );
}

export default App;
