/// <reference types="mocha" />

import { assert } from "chai";
import {
  resolveAliasFromSources,
  type AliasSource,
} from "../../src/modules/aliasChain";
import {
  createEmptyVenueAliasCounts,
  extractVenueAliasFromCrossref,
  getSummaryEntries,
  normalizeVenueAlias,
  resolveVenueAlias,
  VenueAliasResult,
} from "../../src/modules/venueAlias";

describe("venue alias", function () {
  it("extracts first non-empty short container title", function () {
    const alias = extractVenueAliasFromCrossref({
      message: {
        "short-container-title": ["", "NeurIPS"],
      },
    });

    assert.equal(alias, "NeurIPS");
  });

  it("returns undefined when short container title is absent", function () {
    const alias = extractVenueAliasFromCrossref({
      message: {},
    });

    assert.isUndefined(alias);
  });

  it("normalizes multiline aliases to one line", function () {
    assert.equal(
      normalizeVenueAlias("NeurIPS\nProceedings"),
      "NeurIPS Proceedings",
    );
  });

  it("returns undefined for blank normalized aliases", function () {
    assert.isUndefined(normalizeVenueAlias("  \n  "));
  });

  it("has VenueAliasResult enum values", function () {
    assert.equal(VenueAliasResult.MissingDOI, "missingDOI");
    assert.equal(VenueAliasResult.NotFound, "notFound");
    assert.equal(VenueAliasResult.AlreadyUpToDate, "alreadyUpToDate");
    assert.equal(VenueAliasResult.Updated, "updated");
    assert.equal(VenueAliasResult.RequestFailed, "requestFailed");
  });

  it("builds summary entries for a single-item outcome", function () {
    const counts = createEmptyVenueAliasCounts();
    counts[VenueAliasResult.MissingDOI] = 1;

    assert.deepEqual(getSummaryEntries(counts), [
      [VenueAliasResult.MissingDOI, 1],
    ]);
  });

  it("builds summary entries in stable order", function () {
    const counts = createEmptyVenueAliasCounts();
    counts[VenueAliasResult.Updated] = 2;
    counts[VenueAliasResult.AlreadyUpToDate] = 1;
    counts[VenueAliasResult.NotFound] = 3;

    assert.deepEqual(getSummaryEntries(counts), [
      [VenueAliasResult.Updated, 2],
      [VenueAliasResult.AlreadyUpToDate, 1],
      [VenueAliasResult.NotFound, 3],
    ]);
  });

  it("stops the source chain at the first successful source", async function () {
    const calls: string[] = [];
    const sources: AliasSource[] = [
      {
        name: "first",
        async resolve() {
          calls.push("first");
          return {
            sourceName: "first",
            status: "no_result",
          };
        },
      },
      {
        name: "second",
        async resolve() {
          calls.push("second");
          return {
            sourceName: "second",
            status: "success",
            alias: "NeurIPS",
          };
        },
      },
      {
        name: "third",
        async resolve() {
          calls.push("third");
          return {
            sourceName: "third",
            status: "success",
            alias: "ICML",
          };
        },
      },
    ];

    const result = await resolveAliasFromSources(sources, {
      item: {} as any,
      doi: "10.1000/test",
    });

    assert.deepEqual(calls, ["first", "second"]);
    assert.deepEqual(result.attemptedSources, ["first", "second"]);
    assert.equal(result.result.status, "success");
    assert.equal(result.result.alias, "NeurIPS");
  });

  it("returns the last non-success result when the chain misses", async function () {
    const sources: AliasSource[] = [
      {
        name: "first",
        async resolve() {
          return {
            sourceName: "first",
            status: "error",
            error: new Error("temporary failure"),
          };
        },
      },
      {
        name: "second",
        async resolve() {
          return {
            sourceName: "second",
            status: "no_result",
          };
        },
      },
    ];

    const result = await resolveAliasFromSources(sources, {
      item: {} as any,
      doi: "10.1000/test",
    });

    assert.deepEqual(result.attemptedSources, ["first", "second"]);
    assert.equal(result.result.sourceName, "second");
    assert.equal(result.result.status, "no_result");
  });

  it("returns undefined when chained resolution has no result", async function () {
    const alias = await resolveVenueAlias(
      {
        getField() {
          return "10.1000/test";
        },
      } as any,
      [
        {
          name: "crossref",
          async resolve() {
            return {
              sourceName: "crossref",
              status: "no_result",
            };
          },
        },
      ],
    );

    assert.isUndefined(alias);
  });

  it("rethrows chained source errors", async function () {
    const expectedError = new Error("network down");

    try {
      await resolveVenueAlias(
        {
          getField() {
            return "10.1000/test";
          },
        } as any,
        [
          {
            name: "crossref",
            async resolve() {
              return {
                sourceName: "crossref",
                status: "error",
                error: expectedError,
              };
            },
          },
        ],
      );
      assert.fail("Expected resolveVenueAlias to throw");
    } catch (error) {
      assert.equal(error, expectedError);
    }
  });
});
