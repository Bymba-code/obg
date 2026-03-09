import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { routes } from "./routes";
import { useAuth } from "../Hooks/useAuth";

const LoadingScreen = () => (
    <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        fontSize: '18px', color: '#666'
    }}>
        <div>
            <div style={{ marginBottom: '10px' }}>⏳</div>
            <div>Уншиж байна...</div>
        </div>
    </div>
);

const ForbiddenPage = () => (
    <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        height: "100vh", gap: "12px", color: "#64748b",
    }}>
        <div style={{ fontSize: "64px" }}>🚫</div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b" }}>
            Хандах эрхгүй байна
        </h2>
        <p style={{ fontSize: "14px" }}>
            Энэ хуудсанд хандах зөвшөөрөл танд байхгүй байна.
        </p>
        <button
            onClick={() => window.history.back()}
            style={{
                marginTop: "8px", padding: "8px 20px",
                background: "#3b82f6", color: "white",
                border: "none", borderRadius: "8px",
                cursor: "pointer", fontSize: "14px",
            }}
        >
            Буцах
        </button>
    </div>
);

const RouteWrapper = ({ path, element, layout: Layout, protected: isProtected, permission }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    if (loading) return <LoadingScreen />;

    // 1. Нэвтрээгүй → login
    if (isProtected && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Нэвтэрсэн → login/register руу орох гэвэл нүүр хуудас
    if (!isProtected && isAuthenticated && (path === '/login' || path === '/register')) {
        return <Navigate to="/" replace />;
    }

    // 3. Permission шалгах { module, action }
    if (permission && isAuthenticated) {
        const permissions = user?.permissions || {};
        const { module, action } = permission;
        const moduleActions = permissions[module] ?? [];
        if (!moduleActions.includes(action)) return <ForbiddenPage />;
    }

    let content = element;
    if (Layout) content = <Layout>{content}</Layout>;
    return content;
};

const AppRouter = () => (
    <Router>
        <Routes>
            {routes.map((route) => (
                <Route
                    key={route.path}
                    path={route.path}
                    element={<RouteWrapper {...route} />}
                />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </Router>
);

export default AppRouter;