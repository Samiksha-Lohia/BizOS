export function getFirstSidebarPath(role, isSuperAdmin) {
  if (isSuperAdmin) {
    return '/superadmin';
  }
  if (!role) {
    return '/dashboard';
  }
  switch (role) {
    case 'Admin':
    case 'Manager':
      return '/dashboard';
    case 'Accountant':
    case 'Staff':
      return '/dashboard/inventory';
    case 'Employee':
      return '/dashboard/attendance';
    default:
      return '/dashboard';
  }
}
