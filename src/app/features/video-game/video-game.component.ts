import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, AnimationEvent } from '@angular/animations';
import Swal from 'sweetalert2';

interface TrashItem {
  id: number;
  type: 'organic' | 'recyclable-waste' | 'non-recyclable-waste';
  img: string;
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
  public timeLeft = 70;
  private timerInterval: any;
  public draggedItem: TrashItem | null = null;

  public trashItems: TrashItem[] = [
    { id: 12, type: 'recyclable-waste', img: 'assets/trash/soda-cap.jpg', name: 'Tapa de gaseosa', visible: true, state: 'default' },
    { id: 1, type: 'organic', img: 'assets/trash/apple-core.jpg', name: 'Corazón de la manzana', visible: true, state: 'default' },
    { id: 7, type: 'recyclable-waste', img: 'assets/trash/plastic-bottle.jpg', name: 'Botella plástica', visible: true, state: 'default' },
    { id: 9, type: 'recyclable-waste', img: 'assets/trash/straw.jpg', name: 'Pitillo', visible: true, state: 'default' },
    { id: 5, type: 'organic', img: 'assets/trash/coffee-grounds.jpg', name: 'Restos de café', visible: true, state: 'default' },
    { id: 10, type: 'recyclable-waste', img: 'assets/trash/yogurt-cup.jpg', name: 'Vaso de yogur', visible: true, state: 'default' },
    { id: 19, type: 'recyclable-waste', img: 'assets/trash/magazine.jpg', name: 'Revista', visible: true, state: 'default' },
    { id: 4, type: 'organic', img: 'assets/trash/vegetable-peels.jpg', name: 'Cáscaras de vegetales', visible: true, state: 'default' },
    { id: 15, type: 'non-recyclable-waste', img: 'assets/trash/tissue.jpg', name: 'Pañuelo usado', visible: true, state: 'default' },
    { id: 13, type: 'recyclable-waste', img: 'assets/trash/newspaper.jpg', name: 'Periódico', visible: true, state: 'default' },
    { id: 16, type: 'non-recyclable-waste', img: 'assets/trash/napkin.jpg', name: 'Servilleta sucia', visible: true, state: 'default' },
    { id: 6, type: 'organic', img: 'assets/trash/food-leftovers.jpg', name: 'Sobras de comida', visible: true, state: 'default' },
    { id: 17, type: 'non-recyclable-waste', img: 'assets/trash/paper-cup.jpg', name: 'Vaso de papel', visible: true, state: 'default' },
    { id: 14, type: 'recyclable-waste', img: 'assets/trash/cardboard.jpg', name: 'Cartón', visible: true, state: 'default' },
    { id: 3, type: 'organic', img: 'assets/trash/eggshells.jpg', name: 'Cáscaras de huevo', visible: true, state: 'default' },
    { id: 18, type: 'non-recyclable-waste', img: 'assets/trash/pizza-box.jpg', name: 'Caja de pizza', visible: true, state: 'default' },
    { id: 8, type: 'recyclable-waste', img: 'assets/trash/plastic-bag.jpg', name: 'Bolsa plástica', visible: true, state: 'default' },
    { id: 20, type: 'non-recyclable-waste', img: 'assets/trash/broken-paper.jpg', name: 'Papel roto', visible: true, state: 'default' },
    { id: 2, type: 'organic', img: 'assets/trash/banana-peel.jpg', name: 'Cáscara de plátano', visible: true, state: 'default' },
    { id: 11, type: 'recyclable-waste', img: 'assets/trash/shampoo-bottle.jpg', name: 'Envase de champú', visible: true, state: 'default' },
  ];

  public bins: any[] = [
    { type: 'organic', label: 'residuos orgánicos aprovechables', img: 'assets/bins/green-bin.png' },
    { type: 'recyclable-waste', label: 'residuos aprovechables', img: 'assets/bins/white-bin.png' },
    { type: 'non-recyclable-waste', label: 'residuos no aprovechables', img: 'assets/bins/black-bin.png' }
  ]

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
    this.timeLeft = 70;

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
  public onDrop(event: DragEvent, binType: 'organic' | 'recyclable-waste' | 'non-recyclable-waste'): void {
    if (!this.isGameActive || !this.draggedItem) return;
    event.preventDefault();

    const trashType = this.draggedItem.type;

    if (trashType === binType) {
      this.score += 10;
      this.draggedItem.state = 'correct';
    } else {
      // Penalización por error
      this.draggedItem.state = 'incorrect';
      this.score = Math.max(0, this.score - 5);
    }

    if(this.score === 200){
      this.startGame();

      Swal.fire({
        title: '¡Felicidades!',
        text: 'Has alcanzado la puntuación máxima de 200 puntos. ¡Eres un experto en clasificación de residuos!',
        icon: 'success',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2a7236ff'
      });
    }
    else if(this.trashItems.every(item => item.state === 'correct' || !item.visible)){
      this.startGame();

      Swal.fire({
        title: '¡Juego completado!',
        text: `Has clasificado todos los residuos con una puntuación de ${this.score} puntos. ¡Buen trabajo!`,
        icon: 'success',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2a7236ff'
      });
    }
    else if(this.score === 0){
      this.startGame();

      Swal.fire({
        title: '¡Sigue intentando!',
        text: 'Tu puntuación ha bajado a 0 puntos. ¡No te desanimes, puedes mejorar tus habilidades de clasificación de residuos!',
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2a7236ff'
      });
    }
    else if(this.timeLeft === 0){
      this.startGame();

      Swal.fire({
        title: '¡Tiempo agotado!',
        text: 'Se acabó el tiempo. ¡Intenta de nuevo!',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2a7236ff'
      });
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
