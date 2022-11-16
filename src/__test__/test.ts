import {Saga} from '../Saga';

const commitFn = async (count: number): Promise<number> => {
  const val = Math.floor(Math.random() * 100);
  console.log(`commit ${count}`, val);

  return val;
};

const rollbackFn = async (count: number, val: number = 0): Promise<number> => {
  console.log(`rollback ${count}`, val);

  return val;
};

const breakFn = async (count: number): Promise<string> => {
  console.log(`break ${count}`);
  throw new Error('commit error');

  // return 'error';
};

async function execute(): Promise<void> {
  const saga = createSagaFlow();
  const result = await saga.execute();

  console.log(result);
}

function createSagaFlow(): Saga {
  const saga = new Saga();

  return saga
    .setStep<number, number>(
      'step1',
      () => commitFn(1),
      (invokeResult: number) => rollbackFn(1, invokeResult),
    )
    .setStep<number, number>(
      'step2',
      () => commitFn(2),
      (invokeResult: number) => rollbackFn(2, invokeResult),
    )
    .setStep<string, number>(
      'step3',
      () => {
        console.log(saga.getStepByName('step1')?.getInvokeResult());

        return breakFn(3);
      },
      () => rollbackFn(3),
    );
}

(async () => {
  await execute();
})();
