export default class Rect {
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number
  ) {}

  contains(x: number, y: number): boolean {
    return (
      x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    );
  }
}