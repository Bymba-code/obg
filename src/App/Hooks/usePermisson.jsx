import { useAuth } from "./useAuth";

export const usePermission = (requiredPermission) => {
    const { user } = useAuth();
    const permissions = user?.[0]?.data?.permissions || {};

    if (!requiredPermission) return true;
    return !!permissions[requiredPermission]; 
};