//agar multer na ho to apn file ko localstorage me ni rkh skte  mtlb express file ke data ko smjhe ga hi ni
import multer from "multer";
import fs from "fs";

//ye code sidha multer repo se liya hai. https://github.com/expressjs/multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
   
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage })

export const removeLocalFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete local file:", err);
    } else {
      console.log("Local file deleted:", filePath);
    }
  });
};

export const removeLocalFileAsync = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    console.log("Local file deleted:", filePath);
  } catch (err) {
    console.error("Failed to delete local file:", err);
  }
};