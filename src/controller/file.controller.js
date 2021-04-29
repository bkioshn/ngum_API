const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/files/";


// ANCHOR NOTES 
// Connection establish
// Use infura connect to ipfs networks
// Latest version of the libary 29/04/2021:  https://www.npmjs.com/package/ipfs-http-client#example
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
const { globSource } = ipfsClient


const upload = async (req, res) => {
  try {
    await uploadFile(req, res);
    let filename = 'uploads/' + req.body.fileName // uploads/IMG_2891.JPG
    console.log(filename)
    let file = await ipfs.add(globSource(filename + ''))  
    console.log(file)
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  // Get files list from directory
  const directoryPath = __basedir + "/uploads";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

module.exports = {
  upload,
  getListFiles,
  download,
};
