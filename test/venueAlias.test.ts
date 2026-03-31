/// <reference types="mocha" />

import { assert } from "chai";
import {
  createEmptyVenueAliasCounts,
  extractVenueAliasFromCrossref,
  getSummaryEntries,
  normalizeVenueAlias,
  VenueAliasResult,
} from "../src/modules/venueAlias";

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
});
