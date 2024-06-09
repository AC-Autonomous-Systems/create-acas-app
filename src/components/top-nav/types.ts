export type NavigationMenuItemDef = {
  groupName: string;
  permissions: string[];
  tenantPermissions: string[];
  items: {
    title: string;
    description: string;
    href: string;
    permissions: string[];
    tenantPermissions: string[];
  }[];
};
