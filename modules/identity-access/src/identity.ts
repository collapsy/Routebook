import { randomUUID } from "node:crypto";

export type AccountStatus = "active" | "suspended";
export type AccountMembershipRole = "owner" | "editor" | "viewer";
export type AccountMembershipStatus = "active" | "suspended" | "revoked";

export type Account = Readonly<{
  id: string;
  name: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}>;

export type AccountMembership = Readonly<{
  id: string;
  accountId: string;
  userId: string;
  role: AccountMembershipRole;
  status: AccountMembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}>;

export type PersonalAccount = Readonly<{
  account: Account;
  ownerMembership: AccountMembership;
}>;

export type CreatePersonalAccountInput = Readonly<{
  userId: string;
  name: string;
  accountId?: string;
  membershipId?: string;
}>;

export class IdentityAccessValidationError extends Error {
  constructor(
    public readonly code:
      | "account-id-invalid"
      | "membership-id-invalid"
      | "user-id-invalid"
      | "account-name-invalid"
      | "membership-account-mismatch",
  ) {
    super(`Identity and Access validation failed: ${code}.`);
    this.name = "IdentityAccessValidationError";
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validatedUuid(
  value: string,
  code: "account-id-invalid" | "membership-id-invalid" | "user-id-invalid",
): string {
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) throw new IdentityAccessValidationError(code);
  return normalized;
}

export function createPersonalAccount(
  input: CreatePersonalAccountInput,
  now = new Date(),
): PersonalAccount {
  const userId = validatedUuid(input.userId, "user-id-invalid");
  const accountId = validatedUuid(input.accountId ?? randomUUID(), "account-id-invalid");
  const membershipId = validatedUuid(input.membershipId ?? randomUUID(), "membership-id-invalid");
  const name = input.name.trim();

  if (name.length < 2 || name.length > 160) {
    throw new IdentityAccessValidationError("account-name-invalid");
  }

  const account: Account = Object.freeze({
    id: accountId,
    name,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const ownerMembership: AccountMembership = Object.freeze({
    id: membershipId,
    accountId,
    userId,
    role: "owner",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  return Object.freeze({ account, ownerMembership });
}

export function createAccountMembership(
  input: Readonly<{
    id?: string;
    accountId: string;
    userId: string;
    role: AccountMembershipRole;
    status?: AccountMembershipStatus;
  }>,
  now = new Date(),
): AccountMembership {
  return Object.freeze({
    id: validatedUuid(input.id ?? randomUUID(), "membership-id-invalid"),
    accountId: validatedUuid(input.accountId, "account-id-invalid"),
    userId: validatedUuid(input.userId, "user-id-invalid"),
    role: input.role,
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  });
}

export function changeAccountMembershipStatus(
  membership: AccountMembership,
  status: AccountMembershipStatus,
  now = new Date(),
): AccountMembership {
  return Object.freeze({ ...membership, status, updatedAt: now });
}
