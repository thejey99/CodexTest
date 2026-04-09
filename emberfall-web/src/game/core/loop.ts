export type LoopHandler = (time: number) => void;

export const createLoop = (onFrame: LoopHandler) => {
  let raf = 0;

  const frame = (time: number) => {
    onFrame(time);
    raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
    }
  };
};
