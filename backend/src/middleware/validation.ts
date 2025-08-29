import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors: any[] = [];
    errors.array().map((err) => extractedErrors.push({ field: (err as any).param || err.type, message: err.msg }));

    return res.status(422).json({
      error: 'Validation failed',
      errors: extractedErrors,
    });
  };
};