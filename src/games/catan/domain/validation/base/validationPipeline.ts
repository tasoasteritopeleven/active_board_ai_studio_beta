import { CatanMatchState, PlayerId } from '../../model/catanMatchState';
import { CommandEnvelope } from '../../commands/commandEnvelope';

export interface ValidationContext {
  state: CatanMatchState;
  command: CommandEnvelope;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  name: string;
  validate(context: ValidationContext): ValidationResult;
}

export class ValidationPipeline {
  private rules: ValidationRule[] = [];

  addRule(rule: ValidationRule): this {
    this.rules.push(rule);
    return this;
  }

  validate(context: ValidationContext): ValidationResult[] {
    const results: ValidationResult[] = [];
    for (const rule of this.rules) {
      results.push(rule.validate(context));
    }
    return results;
  }
}
