export function validatePhone(phone: string): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/[\s\-().]/g, "");

  if (!/^\+380\d{9}$/.test(cleaned)) {
    return "Телефон має бути у форматі +380XXXXXXXXX (9 цифр після +380)";
  }

  return null;
}
