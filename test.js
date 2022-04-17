const { parseSample } = require("./main");
const sample1 = require("./samples/sample_1").default;
const sample2 = require("./samples/sample_2").default;
const sample3 = require("./samples/sample_3").default;
const { result_1, result_2, result_3 } = require("./expectedResults");

test("Sample 1", () => {
  expect(parseSample(sample1)).toEqual(result_1);
});

test("Sample 2", () => {
  expect(parseSample(sample2)).toEqual(result_2);
});

test("Sample 3", () => {
  expect(parseSample(sample3)).toEqual(result_3);
});
