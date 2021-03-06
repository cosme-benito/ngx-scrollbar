import { AfterViewChecked, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resize-form',
  templateUrl: './resize-form.component.html',
  styleUrls: ['./resize-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizeFormComponent implements AfterViewChecked {

  @Input() value: ResizeChange;
  @Output() valueChange = new EventEmitter<ResizeChange>();

  ngAfterViewChecked() {
    this.valueChange.emit(this.value);
  }

  contentWidthDisplayWith(value: number) {
    return `x${value / 100}`;
  }
}

export interface ResizeChange {
  contentWidth: number;
  contentSize: number;
  componentSize: number;
}
