export function generateSalt(): string {
  const array = new Uint8Array(16); // 16 bytes = 128 bits
  crypto.getRandomValues(array);

  const saltHex: string = Array.from(array)
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join("");
  return saltHex;
}

export async function computeMetadataHash(
  email: string,
  groups: string[],
  taxState: string,
  salt: string
): Promise<string> {
  const groupsStr: string = groups.join(",");
  const message: string = [email, taxState, groupsStr, salt].join("|");
  const encoder = new TextEncoder();
  const data: Uint8Array = encoder.encode(message);
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray: number[] = Array.from(new Uint8Array(hashBuffer));
  const hashHex: string = hashArray
    .map((b: number) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.substring(0, hashHex.length - 2);
}
