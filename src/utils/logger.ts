import { APP_NAME } from './constants';

export const logger = (message: string) => {
  console.log(`[${APP_NAME}] ${message}`);
};