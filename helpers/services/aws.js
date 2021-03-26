const aws = require("aws-sdk");
const config = require("config");
const slugify = require("slugify");
// Configure client for use with Spaces
const endpoint = new aws.Endpoint(config.get("services.aws.endpoint"));
const s3 = new aws.S3({
  endpoint,
  accessKeyId: config.get("services.aws.key"),
  secretAccessKey: config.get("services.aws.secret")
});

class AWS {
  constructor() {}
  // Create a new Space
  createBucket(bucket) {
    var params = {
      Bucket: bucket
    };
    return s3.createBucket(params, function (err, data) {
      if (err) console.log(err, err.stack);
      else data;
    });
  }

  // List all Spaces in the region
  listBuckets() {
    return s3.listBuckets({}, function (err, data) {
      if (err) console.log(err, err.stack);
      else {
        data["Buckets"].forEach(function (space) {
          console.log(space["Name"]);
        });
      }
    });
  }

  // Add a file to a Space
  sendFiletoAws(payload) {
    let folderName = config.get("services.aws.folder");
    payload.originalname = slugify(payload.originalname, {
      remove: /[*+~()'"#!:@]/g,
      replacement: "-",
      lower: true
    });
    payload.originalname = payload.originalname.replace(/_/g, "-");
    let params = {
      Body: payload.buffer,
      Bucket: config.get("services.aws.bucket"),
      Key: `${folderName}/${payload.originalname}`
    };
    let fileData = {
      Bucket: config.get("services.aws.bucket"),
      name: payload.originalname,
      group: folderName,
      Key: `${folderName}/${payload.originalname}`
    };
    return new Promise(async (resolve, reject) => {
      await s3
        .putObject(params)
        .on("build", request => {
          request.httpRequest.headers.Host = endpoint;
          request.httpRequest.headers["Content-Length"] = payload.size;
          request.httpRequest.headers["Content-Type"] = payload.mimetype;
          request.httpRequest.headers["x-amz-acl"] = "public-read";
        })
        .send((err, data) => {
          if (err) reject(err);
          resolve({ data, fileData });
        });
    });
  }

  deleteFileFromAWS(key, bucketName) {
    //Sample Key: "test.jpg"
    let params = { Bucket: bucketName, Key: key };
    s3.deleteObject(params, function (err, data) {
      if (!err) {
        console.log(data);
      } else {
        console.log(err);
      }
    });
  }

  listAllFilesOfBucketsFromAWS(bucketName) {
    let params = {
      Bucket: bucketName
    };

    s3.listObjectsV2(params, function (err, data) {
      if (!err) {
        var files = [];
        data.Contents.forEach(function (element) {
          files.push({
            filename: element.Key
          });
        });
      } else {
        console.log(err);
      }
    });
  }
}
module.exports = new AWS();
