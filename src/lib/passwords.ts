// Local demo only. Appwrite must replace this verifier and the session in V2.
const iterations = 210000;
const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  rounds: number,
) {
  if (!globalThis.crypto?.subtle)
    throw new Error(
      "Local sign-in requires HTTPS or localhost. Open the HTTPS site on your phone.",
    );
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt, iterations: rounds },
        key,
        256,
      ),
    ),
  );
}
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${iterations}$${hex(salt)}$${await derive(password, salt, iterations)}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, rounds, salt, digest] = encoded.split("$");
  if (
    algorithm !== "pbkdf2" ||
    Number(rounds) !== iterations ||
    !/^\w{32}$/.test(salt ?? "") ||
    !/^\w{64}$/.test(digest ?? "")
  )
    return false;
  const actual = await derive(
    password,
    new Uint8Array(salt.match(/../g)!.map((s) => parseInt(s, 16))),
    Number(rounds),
  );
  let difference = 0;
  for (let i = 0; i < actual.length; i++)
    difference |= actual.charCodeAt(i) ^ digest.charCodeAt(i);
  return difference === 0;
}
