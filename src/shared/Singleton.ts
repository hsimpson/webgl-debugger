export class Singleton {
  private static instance: Singleton;

  protected constructor() {} // eslint-disable-line @typescript-eslint/no-empty-function

  public static getInstance<T extends Singleton>(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new this();
    }

    return Singleton.instance;
  }
}
