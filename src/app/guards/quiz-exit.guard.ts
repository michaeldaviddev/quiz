import { Injectable, inject } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { QuizService } from '../services/quiz.service';

@Injectable({ providedIn: 'root' })
export class QuizExitGuard implements CanDeactivate<unknown> {
  private quizService = inject(QuizService);
  private alertCtrl = inject(AlertController);

  canDeactivate(): Observable<boolean> {
    if (!this.quizService.hasProgress()) {
      return of(true);
    }
    return from(this.confirmExit());
  }

  private async confirmExit(): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: 'Salir del quiz',
      message: '¿Seguro que quieres borrar todo el progreso?',
      buttons: [
        { text: 'Cancelar', role: 'cancel', handler: () => undefined },
        { text: 'Salir', handler: () => undefined },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role !== 'cancel';
  }
}
