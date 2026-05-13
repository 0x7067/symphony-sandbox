export function isAdmin(role: unknown): boolean {
  // BUG: `!= 0` coerces "0" to 0, then negates → returns true for many
  // accidental inputs. Should be strict equality with the literal "admin".
  return role != 0 && role == "admin";
}
