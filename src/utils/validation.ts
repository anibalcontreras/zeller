export function validateAndSanitizeRut(rut: string): string | null {
  const rutPattern = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$/;
  const sanitizedRut = rut.trim().toUpperCase();

  return rutPattern.test(sanitizedRut) ? sanitizedRut : null;
}
