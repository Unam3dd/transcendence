import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  showNotification(message: string)
  {
    const toast = document.createElement('div');

    toast.classList.add('toast');
    toast.classList.add('show');
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    const toastBody = document.createElement('div');

    toastBody.classList.add('toast-body');
    toastBody.innerText = message;

    toast.appendChild(toastBody);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  
}