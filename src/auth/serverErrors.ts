import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getFieldErrors } from '../api/client';

// Puts Laravel validation errors under the matching form fields. Returns true if any
// field matched, so the caller can skip the generic form-level message.
export const applyServerErrors = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[]
) => {
  const fieldErrors = getFieldErrors(error);
  let matched = false;
  for (const field of fields) {
    const message = fieldErrors[field as string];
    if (message) {
      setError(field, { type: 'server', message });
      matched = true;
    }
  }
  return matched;
};
