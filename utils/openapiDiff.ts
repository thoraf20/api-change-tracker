import { UploadedFile } from "express-fileupload";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import openapiDiff from "openapi-diff";

export const getDiffFromFiles = async (
  spec1: UploadedFile,
  spec2: UploadedFile
) => {
  const tempDir = path.join(__dirname, "../../temp");
  await fs.mkdir(tempDir, { recursive: true });

  const file1Path = path.join(tempDir, `${uuidv4()}_spec1.yaml`);
  const file2Path = path.join(tempDir, `${uuidv4()}_spec2.yaml`);

  await fs.writeFile(file1Path, spec1.data);
  await fs.writeFile(file2Path, spec2.data);

  // const result = await openapiDiff.diffSpecs({
  //   sourceSpec: { type: "file", content: file1Path },
  //   destinationSpec: { type: "file", content: file2Path },
  // });

  const result = await openapiDiff.diffSpecs({
    sourceSpec: {
      content: file1Path,
      location: "source.json",
      format: "openapi3",
    },
    destinationSpec: {
      content: file2Path,
      location: "destination.json",
      format: "openapi3",
    },
  });

  await fs.unlink(file1Path);
  await fs.unlink(file2Path);

  if ("breakingDifferences" in result) {
    result.breakingDifferences = result.breakingDifferences.map((diff) => {
      return {
        ...diff,
        description: (diff as any).description?.replace(/[\r\n]+/g, " ").trim() || "",
      };
    });
  }

  if ("nonBreakingDifferences" in result) {
    result.nonBreakingDifferences = result.nonBreakingDifferences.map((diff) => {
      return {
        ...diff,
        description: (diff as any).description?.replace(/[\r\n]+/g, " ").trim() || "",
      };
    });
  }

  if ("unclassifiedDifferences" in result) {
    result.unclassifiedDifferences = result.unclassifiedDifferences.map((diff) => {
      return {
        ...diff,
        description: (diff as any).description?.replace(/[\r\n]+/g, " ").trim() || "",
      };
    });
  }

  return {
    summary: {
      // breaking: result.breakingDifferences.length,
      nonBreaking: result.nonBreakingDifferences.length,
      unclassified: result.unclassifiedDifferences.length,
    },
    // breakingChanges: result.,
    nonBreakingChanges: result.nonBreakingDifferences,
    unclassifiedChanges: result.unclassifiedDifferences,
  };
};
