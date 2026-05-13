const DB: Record<number, { id: number; name: string }> = {
  7: { id: 7, name: "Ada" },
  9: { id: 9, name: "Grace" },
};

export async function fetchUserName(id: number): Promise<string> {
  const user = await Promise.resolve(DB[id]);
  if (!user) throw new Error(`no user ${id}`);
  return user.name;
}
