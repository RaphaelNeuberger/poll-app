import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PollService } from '../../../core/services/poll.service';
import { CreatePollData } from '../../../core/models/poll.model';

interface QuestionDraft {
  text: string;
  options: string[];
  allowMultiple: boolean;
}

@Component({
  selector: 'app-create-poll-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-poll-modal.component.html',
  styleUrl: './create-poll-modal.component.scss',
})
export class CreatePollModalComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() pollCreated = new EventEmitter<string>();

  title = '';
  description = '';
  deadline = '';
  category = '';
  showCategories = false;
  readonly categories = ['Team Activities', 'Health & Wellness', 'Gaming & Entertainment', 'Education & Learning', 'Lifestyle & Preferences', 'Technology & Innovation'];

  questions: QuestionDraft[] = [
    { text: '', options: ['', ''], allowMultiple: false }
  ];
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private readonly pollService: PollService) {}

  /** Appends a new empty question with two default answer slots. */
  addQuestion(): void {
    this.questions.push({ text: '', options: ['', ''], allowMultiple: false });
  }

  /** Resets the first question instead of removing it to always keep at least one. */
  removeQuestion(index: number): void {
    if (index === 0) {
      this.questions[0].text = '';
      this.questions[0].options = ['', ''];
      this.questions[0].allowMultiple = false;
    } else {
      this.questions.splice(index, 1);
    }
  }

  /** Adds an empty answer slot to the given question. */
  addOption(questionIndex: number): void {
    this.questions[questionIndex].options.push('');
  }

  /** Removes an answer option; minimum of two options is enforced. */
  removeOption(questionIndex: number, optionIndex: number): void {
    if (this.questions[questionIndex].options.length > 2) {
      this.questions[questionIndex].options.splice(optionIndex, 1);
    }
  }

  /** Maps a zero-based index to A, B, C, D... for option labels. */
  getLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /** Selects a category and closes the dropdown. */
  selectCategory(cat: string): void {
    this.category = cat;
    this.showCategories = false;
  }

  /** Title, description and at least two non-empty options are required. */
  isFormValid(): boolean {
    const hasTitle = this.title.trim().length > 0;
    const hasDescription = this.description.trim().length > 0;
    const validOptions = this.questions[0].options.filter(o => o.trim().length > 0);
    return hasTitle && hasDescription && validOptions.length >= 2;
  }

  /** Validates, builds the payload and delegates to the poll service. */
  async handleSubmit(): Promise<void> {
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const data: CreatePollData = {
      title: this.title.trim(),
      description: this.description.trim() || null,
      deadline: this.deadline || null,
      options: this.questions[0].options.filter(o => o.trim().length > 0),
      category: this.category || null,
    };

    const result = await this.pollService.createPoll(data);

    if (result) {
      this.pollCreated.emit(result.id);
      this.closed.emit();
    } else {
      this.errorMessage.set('Failed to create poll. Please try again.');
    }

    this.isSubmitting.set(false);
  }

  /** Emits the closed event to let the parent unmount this modal. */
  handleClose(): void {
    this.closed.emit();
  }

  /** Prevents clicks inside the modal from bubbling up to the backdrop. */
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
