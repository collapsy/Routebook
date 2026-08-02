import { describe, expect, it } from "vitest";

import {
  changeAccountMembershipStatus,
  createAccountMembership,
  createPersonalAccount,
  IdentityAccessValidationError,
} from "./identity";

const userId = "11111111-1111-4111-8111-111111111111";
const accountId = "22222222-2222-4222-8222-222222222222";
const membershipId = "33333333-3333-4333-8333-333333333333";
const now = new Date("2026-08-02T22:00:00.000Z");

describe("Identity and Access domain", () => {
  it("cria Account pessoal com membership owner ativa", () => {
    const result = createPersonalAccount(
      {
        userId,
        name: "Conta pessoal de Ronaldo",
        accountId,
        membershipId,
      },
      now,
    );

    expect(result).toEqual({
      account: {
        id: accountId,
        name: "Conta pessoal de Ronaldo",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
      ownerMembership: {
        id: membershipId,
        accountId,
        userId,
        role: "owner",
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    });
  });

  it("normaliza nome e rejeita identificadores ou nome inválidos", () => {
    expect(
      createPersonalAccount({
        userId,
        name: "  Minha conta  ",
        accountId,
        membershipId,
      }).account.name,
    ).toBe("Minha conta");

    expect(() => createPersonalAccount({ userId: "invalid", name: "Conta" })).toThrowError(
      new IdentityAccessValidationError("user-id-invalid"),
    );
    expect(() => createPersonalAccount({ userId, name: "x" })).toThrowError(
      new IdentityAccessValidationError("account-name-invalid"),
    );
  });

  it("cria membership explícita e altera somente seu status", () => {
    const membership = createAccountMembership(
      {
        id: membershipId,
        accountId,
        userId,
        role: "editor",
      },
      now,
    );
    const suspendedAt = new Date("2026-08-03T10:00:00.000Z");

    expect(changeAccountMembershipStatus(membership, "suspended", suspendedAt)).toEqual({
      ...membership,
      status: "suspended",
      updatedAt: suspendedAt,
    });
  });
});
