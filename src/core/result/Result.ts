export type Result<T, E = Error> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({
  success: true,
  value,
});

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

export const isOk = <T, E>(result: Result<T, E>): result is { readonly success: true; readonly value: T } => {
  return result.success;
};

export const isErr = <T, E>(result: Result<T, E>): result is { readonly success: false; readonly error: E } => {
  return !result.success;
};
