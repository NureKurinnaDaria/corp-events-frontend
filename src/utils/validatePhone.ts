export function validatePhone(phone: string): string | null {
  if (!phone) return null;

  const cleaned = phone.replace(/[\s\-().]/g, "");

  if (!/^\+\d{10,15}$/.test(cleaned)) {
    return "Невірний формат телефону. Приклад: +380669879099";
  }

  if (/^\+380/.test(cleaned) && cleaned.length !== 13) {
    return "Український номер має містити 12 цифр після +";
  }

  return null;
}
