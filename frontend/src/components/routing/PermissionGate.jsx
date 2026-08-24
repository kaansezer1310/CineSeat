import useAuth from "../../hooks/useAuth.js";

function PermissionGate({
  permissions,
  mode = "all",
  fallback = null,
  children,
}) {
  const { hasPermission } = useAuth();
  const isAllowed =
    mode === "any"
      ? permissions.some(hasPermission)
      : permissions.every(hasPermission);

  return isAllowed ? children : fallback;
}

export default PermissionGate;
