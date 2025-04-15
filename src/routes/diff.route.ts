import fileUpload from "express-fileupload";
import { getDiffFromFiles } from "../utils/openapiDiff";

export const compareSpecsFromUpload = async (req, res, next) => {
  try {
    if (!req.files || !req.files.spec1 || !req.files.spec2) {
      return res
        .status(400)
        .json({ error: "Two OpenAPI spec files (spec1, spec2) are required." });
    }

    const spec1 = req.files.spec1 as fileUpload.UploadedFile;
    const spec2 = req.files.spec2 as fileUpload.UploadedFile;

    const diffResult = await getDiffFromFiles(spec1, spec2);

    res.status(200).json(diffResult);
  } catch (err) {
    next(err);
  }
};
