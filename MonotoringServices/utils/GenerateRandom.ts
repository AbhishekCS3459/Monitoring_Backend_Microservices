export async function DbError(): Promise<{
  result: string;
  timeTaken?: number;
}> {
  const random = Math.floor(Math.random() * 10);

  if (random % 3 === 0) {
    throw new Error("Acces Denied!!");
  } else {
    const startTime = Date.now();
    await sleep(1000);
    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    return { result: "slow", timeTaken: elapsedTime };
  }
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
