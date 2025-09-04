import { Component, AfterViewInit, ViewChild, QueryList } from '@angular/core';

@Component({
  selector: 'app-video-game',
  standalone: true,
  imports: [],
  templateUrl: './video-game.component.html',
  styleUrl: './video-game.component.scss'
})
export class VideoGameComponent implements AfterViewInit {

  @ViewChild('score') scoreElement!: HTMLElement;
  @ViewChild('timer') timerElement!: HTMLElement;
  @ViewChild('startButton') startButton!: HTMLElement;
  @ViewChild('trashItem') trashItem!: QueryList<HTMLElement>;
  @ViewChild('bin') bin!: QueryList<HTMLElement>;

  constructor() {

  }

  ngAfterViewInit(): void {
    // Elementos del juego
    const trashItems = this.trashItem;
    const bins = this.bin;
    const scoreElement = this.scoreElement;
    const timerElement = this.timerElement;
    const startButton = this.startButton;

    // Variables del juego
    let score = 0;
    let timeLeft = 60;
    let timerInterval: any;
    let isGameActive = false;

    // Inicializar elementos arrastrables
    trashItems.forEach(item => {
      item.setAttribute('draggable', 'true');

      item.addEventListener('dragstart', function (e: DragEvent) {
        if (!isGameActive) return;
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', item.getAttribute('data-type') || '');
          setTimeout(() => {
            item.style.opacity = '0.5';
          }, 0);
        }
      });

      item.addEventListener('dragend', function () {
        item.style.opacity = '1';
      });
    });

    // Configurar contenedores como destinos de arrastre
    bins.forEach(bin => {
      bin.addEventListener('dragover', function (e) {
        if (!isGameActive) return;
        e.preventDefault();
        bin.style.transform = 'scale(1.05)';
      });

      bin.addEventListener('dragleave', function () {
        bin.style.transform = 'scale(1)';
      });

      bin.addEventListener('drop', function (e: DragEvent) {
        if (!isGameActive) return;
        e.preventDefault();
        bin.style.transform = 'scale(1)';

        if (!e.dataTransfer) return;
        const trashType = e.dataTransfer.getData('text/plain');
        const binType = bin.classList.contains('bin-organic') ? 'organic' :
          bin.classList.contains('bin-plastic') ? 'plastic' : 'paper';

        // Encontrar el elemento que se está arrastrando
        const draggedItem = document.querySelector('.trash-item[style*="opacity: 0.5"]') as HTMLElement;

        if (draggedItem) {
          if (trashType === binType) {
            // Clasificación correcta
            score += 10;
            scoreElement.textContent = score.toString();
            draggedItem.classList.add('correct');

            // Ocultar el elemento después de un tiempo
            setTimeout(() => {
              draggedItem.style.visibility = 'hidden';
            }, 500);
          } else {
            // Clasificación incorrecta
            draggedItem.classList.add('incorrect');
            setTimeout(() => {
              draggedItem.classList.remove('incorrect');
            }, 500);
          }
        }
      });
    });

    // Iniciar juego
    startButton.addEventListener('click', function () {
      if (isGameActive) {
        resetGame();
        return;
      }

      isGameActive = true;
      score = 0;
      timeLeft = 60;
      scoreElement.textContent = score.toString();
      timerElement.textContent = timeLeft.toString();

      startButton.textContent = 'Reiniciar Juego';

      // Mostrar todos los elementos de basura
      trashItems.forEach(item => {
        item.style.visibility = 'visible';
        item.classList.remove('correct', 'incorrect');
      });

      // Iniciar temporizador
      timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft.toString();

        if (timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    });

    // Finalizar juego
    function endGame() {
      clearInterval(timerInterval);
      isGameActive = false;

      // Crear mensaje de fin de juego
      const gameOverDiv = document.createElement('div');
      gameOverDiv.className = 'game-over';
      gameOverDiv.innerHTML = `
                    <h2>¡Tiempo Agotado!</h2>
                    <p>Tu puntuación final: ${score}</p>
                    <button onclick="this.parentElement.remove(); document.querySelector('.overlay').remove();">Cerrar</button>
                `;

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      document.body.appendChild(overlay);
      document.body.appendChild(gameOverDiv);
    }

    // Reiniciar juego
    function resetGame() {
      clearInterval(timerInterval);
      isGameActive = false; 
      startButton.textContent = 'Comenzar Juego';

      // Mostrar todos los elementos de basura
      trashItems.forEach(item => {
        item.style.visibility = 'visible';
        item.classList.remove('correct', 'incorrect');
      });
    }
  };
}
