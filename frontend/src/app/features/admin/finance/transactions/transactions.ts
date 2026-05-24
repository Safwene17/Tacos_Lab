import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';
import { Router } from '@angular/router';

import { AdminFinanceControllerApiService } from '../../../../core/api/api/adminFinanceController.service';

import { TransactionResponseDto } from '../../../../core/api/model/transactionResponse';
import type { PageableDto } from '../../../../core/api/model/pageable';

type TransactionType = TransactionResponseDto.TypeEnum;
type PaymentMethod = TransactionResponseDto.PaymentMethodEnum;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './transactions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Transactions {
  private readonly router = inject(Router);
  private readonly financeApi = inject(AdminFinanceControllerApiService);

  readonly TransactionResponseDto = TransactionResponseDto;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly transactions = signal<TransactionResponseDto[]>([]);

  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly type = signal<TransactionType | ''>('');
  readonly paymentMethod = signal<PaymentMethod | ''>('');
  readonly from = signal('');
  readonly to = signal('');

  readonly pages = computed(() => {
    const total = this.totalPages();

    if (total <= 1) {
      return [];
    }

    const current = this.page();
    const start = Math.max(0, current - 2);
    const end = Math.min(total, start + 5);

    return Array.from({ length: end - start }, (_, index) => start + index);
  });

  constructor() {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading.set(true);
    this.error.set(null);

    const pageable: PageableDto = {
      page: this.page(),
      size: this.size(),
      sort: ['transactionDate,desc'],
    };

    this.financeApi
      .transactions(
        pageable,
        this.type() || undefined,
        this.from() || undefined,
        this.to() || undefined,
        undefined,
        undefined,
        this.paymentMethod() || undefined,
      )
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.error.set(response.message ?? 'Unable to load transactions.');
            return;
          }

          this.transactions.set(response.data.content ?? []);
          this.page.set(response.data.page ?? 0);
          this.size.set(response.data.size ?? 10);
          this.totalElements.set(response.data.totalElements ?? 0);
          this.totalPages.set(response.data.totalPages ?? 0);
        },
        error: (error: unknown) => {
          this.error.set(this.errorMessage(error));
        },
      });
  }

  applyFilters(): void {
    this.page.set(0);
    this.loadTransactions();
  }

  resetFilters(): void {
    this.type.set('');
    this.paymentMethod.set('');
    this.from.set('');
    this.to.set('');
    this.page.set(0);
    this.loadTransactions();
  }

  createTransaction(): void {
    void this.router.navigateByUrl('/admin/transactions/new');
  }

  editTransaction(transaction: TransactionResponseDto): void {
    if (!transaction.id) {
      return;
    }

    void this.router.navigate(['/admin/transactions', transaction.id, 'edit']);
  }

  deleteTransaction(transaction: TransactionResponseDto): void {
    if (!transaction.id) {
      return;
    }

    const confirmed = window.confirm('Delete this transaction?');

    if (!confirmed) {
      return;
    }

    this.financeApi.deleteTransaction(transaction.id).subscribe({
      next: () => {
        toast.success('Transaction deleted successfully.');
        this.loadTransactions();
      },
      error: (error: unknown) => {
        toast.error(this.errorMessage(error));
      },
    });
  }

  previousPage(): void {
    if (this.page() === 0 || this.loading()) {
      return;
    }

    this.page.update((page) => page - 1);
    this.loadTransactions();
  }

  nextPage(): void {
    if (this.page() + 1 >= this.totalPages() || this.loading()) {
      return;
    }

    this.page.update((page) => page + 1);
    this.loadTransactions();
  }

  goToPage(page: number): void {
    if (page === this.page() || this.loading()) {
      return;
    }

    this.page.set(page);
    this.loadTransactions();
  }

  money(value?: number, currency = 'RON'): string {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  date(value?: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(value));
  }

  value(value?: string | null): string {
    return value && value.trim().length > 0 ? value : '-';
  }

  typeBadgeClass(type?: string): string {
    if (type === TransactionResponseDto.TypeEnum.Income) {
      return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500';
    }

    return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500';
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? `Request failed with status ${error.status}.`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error.';
  }
}
