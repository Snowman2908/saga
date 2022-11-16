import {SagaState} from './Types';

export class Step<RespInv = any, RespComp = any> {
  private readonly name: string;
  private invokeFn: () => Promise<RespInv>;
  private invokeState: SagaState;
  private invokeResult: RespInv;
  private compensateFn: (invokeResult: RespInv) => Promise<RespComp>;
  private compensateState: SagaState;
  private compensateResult: RespComp;

  constructor(
    name: string,
    invokeFn: () => Promise<RespInv>,
    compensateFn: (invokeResult: RespInv) => Promise<RespComp>,
  ) {
    this.name = name;
    this.invokeState = SagaState.Failed;
    this.compensateState = SagaState.Failed;
    this.invokeFn = invokeFn;
    this.compensateFn = compensateFn;
    this.invokeResult = {} as RespInv;
    this.compensateResult = {} as RespComp;
  }

  getName(): string {
    return this.name;
  }

  getInvokeResult(): RespInv {
    return this.invokeResult;
  }

  setInvokeState(state: SagaState): void {
    this.invokeState = state;
  }

  setInvokeResult(result: RespInv): void {
    this.invokeResult = result;
  }

  setCompensateState(state: SagaState): void {
    this.compensateState = state;
  }

  setCompensateResult(result: RespComp): void {
    this.compensateResult = result;
  }

  async runInvokeFn(step: Step<RespInv, RespComp>): Promise<RespInv> {
    return await step.invokeFn();
  }

  async runCompensateFn(step: Step<RespInv, RespComp>): Promise<RespComp> {
    return await step.compensateFn(step.invokeResult);
  }
}
