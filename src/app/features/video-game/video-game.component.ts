import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface TrashItem {
  id: number;
  type: 'organic' | 'plastic' | 'paper';
  icon: string;
  name: string;
  visible: boolean;
}

@Component({
  selector: 'app-video-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-game.component.html',
  styleUrl: './video-game.component.scss'
})
export class VideoGameComponent {

  public isGameActive = false;
  public score = 0;
  public timeLeft = 60;
  private timerInterval: any;
  public draggedItem: TrashItem | null = null;

  public trashItems: TrashItem[] = [
    { id: 1, type: 'organic', icon: '🍎', name: 'Manzana', visible: true },
    { id: 2, type: 'plastic', icon: '🧴', name: 'Botella', visible: true },
    { id: 3, type: 'paper', icon: '📰', name: 'Periódico', visible: true },
    { id: 4, type: 'organic', icon: '🍌', name: 'Plátano', visible: true },
    { id: 5, type: 'plastic', icon: '🥤', name: 'Vaso', visible: true },
    { id: 6, type: 'paper', icon: '📦', name: 'Caja', visible: true },
  ];

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
    this.trashItems.forEach(item => (item.visible = true));
  }

  // Drag start
  public onDragStart(event: DragEvent, item: TrashItem): void {
    if (!this.isGameActive) return;
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
      this.draggedItem.visible = false; // Oculta el item al clasificar
    } else {
      // Penalización por error
      this.score = Math.max(0, this.score - 5);
    }

    this.draggedItem = null;
  }

  public onDragOver(event: DragEvent): void {
    if (this.isGameActive) event.preventDefault();
  }
}
