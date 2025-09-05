import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, AnimationEvent } from '@angular/animations';

interface TrashItem {
  id: number;
  type: 'organic' | 'plastic' | 'paper';
  icon: string;
  name: string;
  visible: boolean;
  state: 'default' | 'dragging' | 'incorrect' | 'correct';
}

@Component({
  selector: 'app-video-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-game.component.html',
  styleUrl: './video-game.component.scss',
  animations: [
    trigger('trashAnimation', [
      state('default', style({ transform: 'scale(1)', opacity: 1 })),
      state('dragging', style({ transform: 'scale(1.1)', opacity: 0.8 })),
      state('incorrect', style({ transform: 'scale(1)', opacity: 1 })),
      state('correct', style({ transform: 'scale(0)', opacity: 0 })),
      // dragging transitions
      transition('default => dragging', animate('150ms ease-in')),
      transition('dragging => default', animate('150ms ease-out')),

      // incorrect: shake with keyframes
      transition('* => incorrect', [
        animate(
          '400ms',
          keyframes([
            style({ transform: 'translateX(0)', offset: 0 }),
            style({ transform: 'translateX(-10px)', offset: 0.25 }),
            style({ transform: 'translateX(10px)', offset: 0.5 }),
            style({ transform: 'translateX(-6px)', offset: 0.75 }),
            style({ transform: 'translateX(0)', offset: 1.0 })
          ])
        )
      ]),

      // correct: shrink & fade
      transition('* => correct', [
        animate(
          '350ms ease-in',
          keyframes([
            style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
            style({ transform: 'scale(0.6)', opacity: 0.6, offset: 0.6 }),
            style({ transform: 'scale(0)', opacity: 0, offset: 1 })
          ])
        )
      ]),

      // optional: a smooth return from incorrect -> default
      transition('incorrect => default', animate('200ms ease-out'))
    ])
  ]
})
export class VideoGameComponent {

  public isGameActive = false;
  public score = 0;
  public timeLeft = 60;
  private timerInterval: any;
  public draggedItem: TrashItem | null = null;

  public trashItems: TrashItem[] = [
    { id: 1, type: 'organic', icon: '🍎', name: 'Manzana', visible: true, state: 'default' },
    { id: 2, type: 'plastic', icon: '🧴', name: 'Botella', visible: true, state: 'default' },
    { id: 3, type: 'paper', icon: '📰', name: 'Periódico', visible: true, state: 'default' },
    { id: 4, type: 'organic', icon: '🍌', name: 'Plátano', visible: true, state: 'default' },
    { id: 5, type: 'plastic', icon: '🥤', name: 'Vaso', visible: true, state: 'default' },
    { id: 6, type: 'paper', icon: '📦', name: 'Caja', visible: true, state: 'default' },
  ];

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  public startGame(): void {
    if (this.isGameActive) {
      this.resetGame();
      return;
    }

    this.isGameActive = true;
    this.score = 0;
    this.timeLeft = 60;

    // Muestra todos los ítems
    this.trashItems.forEach(item => (item.visible = true));

    // Inicia temporizador
    this.timerInterval = setInterval(() => {
      this.timeLeft--;

      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  // Termina el juego
  private endGame(): void {
    clearInterval(this.timerInterval);
    this.isGameActive = false;
  }

  // Reinicia el juego
  private resetGame(): void {
    clearInterval(this.timerInterval);
    this.isGameActive = false;
    this.trashItems.forEach(item => (item.state = 'default'));
  }

  // Drag start
  public onDragStart(event: DragEvent, item: TrashItem): void {
    if (!this.isGameActive) return;

    item.state = 'dragging'
    this.draggedItem = item;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', item.type);
    }
  }

  // Drop
  public onDrop(event: DragEvent, binType: 'organic' | 'plastic' | 'paper'): void {
    if (!this.isGameActive || !this.draggedItem) return;
    event.preventDefault();

    const trashType = this.draggedItem.type;

    if (trashType === binType) {
      this.score += 10;
      this.draggedItem.state = 'correct';
      //this.draggedItem.visible = false; // Oculta el item al clasificar
    } else {
      // Penalización por error
      this.draggedItem.state = 'incorrect';
      this.score = Math.max(0, this.score - 5);
    }

    this.draggedItem = null;
  }

  public onDragOver(event: DragEvent): void {
    if (this.isGameActive) event.preventDefault();
  }

  onTrashAnimationDone(event: AnimationEvent, item: TrashItem) {
    // cuando la animación terminó en 'incorrect' volvemos a 'default'
    if (event.toState === 'incorrect') {
      item.state = 'default';
    }

    // cuando la animación terminó en 'correct', ocultamos el item
    if (event.toState === 'correct') {
      item.visible = false;
      // opcional: set item.state a default si vuelves a reutilizar
      item.state = 'default';
    }
  }
}
