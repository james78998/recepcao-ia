export function formatPhone(phone) {
  return phone;
}
export function formatPhone(phone) {
  const numbers = phone.replace(/\D/g, "");

  if (numbers.length === 11) {
    return numbers.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3"
    );
  }

  return phone;
}