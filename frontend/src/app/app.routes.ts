import { Routes } from '@angular/router';
import { adminAuthGuard, guestOnlyGuard } from './core/auth/auth.guard';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'login',
    canActivate: [guestOnlyGuard],
    loadComponent: () => import('./features/admin/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./features/admin/layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'menu',
        children: [
          {
            path: 'categories',
            loadComponent: () =>
              import('./features/admin/menus/menu-categories/menu-categories').then(
                (m) => m.MenuCategories,
              ),
          },
          {
            path: 'categories/new',
            loadComponent: () =>
              import('./features/admin/menus/menu-category-form/menu-category-form').then(
                (m) => m.MenuCategoryForm,
              ),
          },
          {
            path: 'categories/:id/edit',
            loadComponent: () =>
              import('./features/admin/menus/menu-category-form/menu-category-form').then(
                (m) => m.MenuCategoryForm,
              ),
          },
          {
            path: 'items',
            loadComponent: () =>
              import('./features/admin/menus/menu-items/menu-items').then((m) => m.MenuItems),
          },
          {
            path: 'items/new',
            loadComponent: () =>
              import('./features/admin/menus/menu-item-form/menu-item-form').then(
                (m) => m.MenuItemForm,
              ),
          },
          {
            path: 'items/:id/edit',
            loadComponent: () =>
              import('./features/admin/menus/menu-item-form/menu-item-form').then(
                (m) => m.MenuItemForm,
              ),
          },
        ],
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/admin/employees/employee-list/employee-list').then(
            (m) => m.EmployeeList,
          ),
      },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./features/admin/employees/employee-detail/employee-detail').then(
            (m) => m.EmployeeDetail,
          ),
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () =>
          import('./features/admin/employees/employee-edit/employee-edit').then(
            (m) => m.EmployeeEdit,
          ),
      },

      //-------payroll pages-------//

      {
        path: 'employees/:id/payroll/new',
        loadComponent: () =>
          import('./features/admin/employees/payroll-create/payroll-create').then(
            (m) => m.PayrollCreate,
          ),
      },
      {
        path: 'employees/:employeeId/payroll/:payrollRecordId/edit',
        loadComponent: () =>
          import('./features/admin/employees/payroll-edit/payroll-edit').then((m) => m.PayrollEdit),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings').then((m) => m.Settings),
      },
      // -------finance pages------- //

      {
        path: 'transactions/new',
        loadComponent: () =>
          import('./features/admin/finance/transaction-create/transaction-create').then(
            (m) => m.TransactionCreate,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./features/admin/finance/transactions/transactions').then((m) => m.Transactions),
      },
      {
        path: 'transactions/:id/edit',
        loadComponent: () =>
          import('./features/admin/finance/transaction-edit/transaction-edit').then(
            (m) => m.TransactionEdit,
          ),
      },
      {
        path: 'transaction-categories',
        loadComponent: () =>
          import('./features/admin/finance/transaction-categories/transaction-categories').then(
            (m) => m.TransactionCategories,
          ),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
