import { describe, expect, it } from "vitest";
import { createTestMigrator, testBasePersonSchema } from "../utils";
import { z } from "zod";
import { mutators } from "../../src";

describe("mutate.up", () => {
  it("should work with removeOne", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema,
    })
      .add({
        defaultVal: "",
        path: "cheese",
        schema: z.string(),
      })
      .mutate(() => mutators.removeOne("cheese"));

    expect(evolver.transform({})).toEqual({
      name: "",
      age: 0,
    });
  });
});

describe.skip("mutate.isValid", () => {
  // TODO
});

describe.skip("mutate.rewritePaths", () => {
  // TODO
});

describe("mutate.rewriteRenames", () => {
  it("should remove renames if points to the field that is renamed", () => {
    const rewriteRenames = mutators.removeOne<
      { name: string; age: number },
      "name"
    >("name").rewriteRenames;

    const result = rewriteRenames({
      renames: [
        ["a", "b"],
        ["startName", "firstName"],
        ["firstName", "name"],
        ["c", "d"],
      ],
    });
    expect(result).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });
});

describe("mutate.beforeMutate", () => {
  it("should throw an error if referencing a path that's already there", async () => {
    const beforeMutateResult = await Promise.resolve()
      .then(() => {
        const a = mutators
          .removeOne<{ name: string }, "name">("name")
          .beforeMutate({
            paths: [],
          });
        console.log(a);
      })
      .catch((e) => e);

    expect(beforeMutateResult).toBeInstanceOf(Error);
    expect(beforeMutateResult.message).toBe(`Path name not found`);
  });
  it("should not throw error if path found", async () => {
    const beforeMutateResult = await Promise.resolve()
      .then(() => {
        mutators.removeOne<{ name: string }, "name">("name").beforeMutate({
          paths: [{ path: "name", schema: z.string() }],
        });
      })
      .catch((e) => e);

    expect(beforeMutateResult).not.toBeInstanceOf(Error);
  });
});

describe("tests with migrator", () => {
  it("should poop out the right thing", () => {
    const evolver = createTestMigrator({
      endingSchema: testBasePersonSchema.omit({ age: true }),
    }).remove("age");

    expect(evolver.transform({})).toEqual({ name: "" });
    expect(evolver.transform({ name: "Jon" })).toEqual({ name: "Jon" });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (): { name: string } => evolver.transform({});
  });
});
