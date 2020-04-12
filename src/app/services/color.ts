export class Color {
  public r = 0; // 0-255
  public g = 0; // 0-255
  public b = 0; // 0-255
  public a = 0; // 0-255

  public setFromArray(array: number[] | Uint8Array | Uint8ClampedArray): void {
    this.r = array[0];
    this.g = array[1];
    this.b = array[2];
    this.a = array[3];
  }

  public getAsArrayUint8(): Uint8Array {
    return new Uint8Array([this.r, this.g, this.b, this.a]);
  }

  public getAsArrayFloat(): Float32Array {
    return new Float32Array([this.r / 255, this.g / 255, this.b / 255, this.a / 255]);
  }

  public getRGBStyle(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  public getRGBAStyle(): string {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
  }

  public getRGBHtml(): string {
    const rStr = this.r.toString(16).padStart(2, '0');
    const gStr = this.g.toString(16).padStart(2, '0');
    const bStr = this.b.toString(16).padStart(2, '0');
    return `#${rStr}${gStr}${bStr}`;
  }
}
