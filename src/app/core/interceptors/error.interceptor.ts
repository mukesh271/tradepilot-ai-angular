import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

const getMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'The request could not be processed.';
    case 401:
      return 'Your session is no longer valid.';
    case 403:
      return 'Access to this resource is forbidden.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'The server encountered an issue. Please try again.';
    default:
      return 'Unable to complete the request. Please try again.';
  }
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiMessage = error?.error?.message;
      const apiErrors = error?.error?.errors;
      const detail = Array.isArray(apiErrors) ? apiErrors.filter((item): item is string => typeof item === 'string').join(' ') : '';
      const message = error.status === 0
        ? 'Cannot reach the API. Check the backend URL, that the server is running, and that CORS allows this frontend origin.'
        : [apiMessage ?? getMessage(error.status), detail].filter(Boolean).join(' ');
      notifications.error(message);
      return throwError(() => new Error(message));
    })
  );
};
