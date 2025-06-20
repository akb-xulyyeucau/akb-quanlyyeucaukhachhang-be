export function compareVN(a: string, b: string) {
  return a.localeCompare(b, 'vi', { sensitivity: 'base' });
}

export function splitVietnameseName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const lastName = parts[0] || "";
  const middleName = parts.slice(1, -1).join(" ") || "";
  const firstName = parts[parts.length - 1] || "";
  return { firstName, middleName, lastName };
}