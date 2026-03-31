/// <reference types="mocha" />

import { assert } from "chai";
import {
  extractVenueAliasFromCrossref,
  normalizeVenueAlias,
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
});
