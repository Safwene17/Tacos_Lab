import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-ingredient-chips',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ingredient-chips.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IngredientChips {
  @Input() value: string[] = [];
  @Input() placeholder = 'e.g. Chicken';
  @Input() helper = 'Add the ingredients customers should know about.';
  @Output() valueChange = new EventEmitter<string[]>();

  newIngredient = '';

  add() {
    const next = (this.newIngredient || '').trim();
    if (!next) return;
    const normalized = next;
    if ((this.value || []).some((v) => v.toLowerCase() === normalized.toLowerCase())) {
      this.newIngredient = '';
      return;
    }
    const updated = [...(this.value || []), normalized];
    this.valueChange.emit(updated);
    this.newIngredient = '';
  }

  remove(index: number) {
    const updated = [...(this.value || [])];
    updated.splice(index, 1);
    this.valueChange.emit(updated);
  }

  onKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.add();
    }
  }
}
