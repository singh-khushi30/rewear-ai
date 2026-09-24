export class LooksUnavailableError extends Error {
  constructor() {
    super("Saved looks are unavailable.");
    this.name = "LooksUnavailableError";
  }
}

export class ForeignGarmentError extends Error {
  constructor() {
    super("A look can only be saved from garments you own.");
    this.name = "ForeignGarmentError";
  }
}
