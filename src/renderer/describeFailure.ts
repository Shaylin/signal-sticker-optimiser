export function describeFailure(error: unknown): string {
  if (error instanceof Error && error.message !== "") {
    return error.message;
  }
  return "Something went wrong";
}
