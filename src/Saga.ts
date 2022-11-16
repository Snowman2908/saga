import {Step} from './Step';
import {SagaState} from './Types';

export class Saga {
  private steps: Step[] = [];
  private compensationSteps: Step[] = [];

  setStep<RespInv, RespComp>(
    name: string = '',
    invokeFn: () => Promise<RespInv>,
    compensateFn: (invokeResult: RespInv) => Promise<RespComp>,
  ): Saga {
    const step = new Step<RespInv, RespComp>(name, invokeFn, compensateFn);

    this.steps.push(step);

    return this;
  }

  getStepByName(name: string): Step | undefined {
    return this.steps.find(step => step.getName() === name);
  }

  async execute(): Promise<void | Error> {
    try {
      await this.invoke();
    } catch (error) {
      await this.compensate();

      return error as Error;
    }
  }

  async invoke(): Promise<void> {
    for (const step of this.steps) {
      const result = await step.runInvokeFn(step);

      step.setInvokeState(SagaState.Done);
      step.setInvokeResult(result);

      this.compensationSteps.push(step);
    }
  }

  async compensate(): Promise<void> {
    for (const step of this.compensationSteps.reverse()) {
      const result = await step.runCompensateFn(step);

      step.setCompensateState(SagaState.Done);
      step.setCompensateResult(result);
    }
  }
}
