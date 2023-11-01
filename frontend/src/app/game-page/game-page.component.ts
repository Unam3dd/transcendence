import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss']
})
export class GamePageComponent implements AfterViewInit {
  @ViewChild('gameCanvas', {static: true}) canvas!: ElementRef;

  barLeftY!: number;
  barRightY!: number;
  barHeight: number = 50;
  barWidth: number = 10;
  barSpeed: number = 25;

  ngAfterViewInit() {
    this.adjustCanvasDPI()

    const centerY: number = (this.canvas.nativeElement.height - this.barHeight) / 2;
    this.barRightY = centerY;
    this.barLeftY = centerY;

    this.drawElements();
  }

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      this.barRightY -= this.barSpeed;
    } else if (event.key === 'ArrowDown') {
      this.barRightY += this.barSpeed;
    } else if (event.key === 'w' || event.key === 'W') {
      this.barLeftY -= this.barSpeed;
    } else if (event.key === 's' || event.key === 'S') {
      this.barLeftY += this.barSpeed;
    }

    this.drawElements();
  }

  //Adjust DPI in the canvas
  adjustCanvasDPI() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    const scale = window.devicePixelRatio;

    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight *scale;

    if (context) {
      context.scale(scale, scale);
    }
  }

  drawElements() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      //Draw rackets
      context.fillStyle = 'white';
      context.fillRect(40, this.barLeftY, this.barWidth, this.barHeight); //draw left bar
      context.fillRect(canvas.width - (40 + this.barWidth), this.barRightY, this.barWidth, this.barHeight); //draw right bar

      //draw the center line
      context.strokeStyle = 'white';
      context.setLineDash([20, 15]);  //Height and space between lines
      context.lineWidth = 2;  //Width of the line

      context.beginPath();
      const centerX: number = canvas.width / 2;
      context.moveTo(centerX, 0);
      context.lineTo(centerX, canvas.height);
      context.stroke();
    }
  }
}
