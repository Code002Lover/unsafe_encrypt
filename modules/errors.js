class InvalidOptionsError extends Error {
    constructor(message) {
      super(message);
      this.name = "InvalidOptionsError";
    }
  }