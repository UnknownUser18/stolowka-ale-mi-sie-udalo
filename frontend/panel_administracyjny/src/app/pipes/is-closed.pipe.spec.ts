import { IsClosedPipe } from './is-closed.pipe';

describe('IsClosedPipe', () => {
  it('create an instance', () => {
    const pipe = new IsClosedPipe();
    expect(pipe).toBeTruthy();
  });
});
