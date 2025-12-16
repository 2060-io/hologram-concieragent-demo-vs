import { Request, Response } from 'express';

/**
 * Health check controller
 */
export class HealthController {
  /**
   * GET /health - Health check endpoint
   */
  static getHealth(req: Request, res: Response): void {
    res.json({ status: 'ok', service: 'concieragent' });
  }
}
