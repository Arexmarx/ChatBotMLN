export const ROUTES = {
  HOME: "/",
  DASHBOARD: {
    ROOT: "/dashboard",
    PUBLIC: {
      ROOT: "/dashboard/public",
      REGISTER: "/dashboard/public/register",
      FORGOT_PASSWORD: "/dashboard/public/forgot-password",
      LOGIN: "/dashboard/public/login",
    },
  },
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: "/dashboard",
  USERS: "/dashboard/users",
} as const;
