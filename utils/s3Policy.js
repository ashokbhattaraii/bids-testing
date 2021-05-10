var crypto = require("crypto");

function dateString() {
  var date = new Date().toISOString();
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
}

function hmac(key, string) {
  var hmac = crypto.createHmac("sha256", key);
  hmac.end(string);
  return hmac.read();
}

class aws_s3 {
  constructor(cfg) {
    cfg = cfg || {};

    //aws credentials
    this.access_key = cfg.access_key;
    this.secret = cfg.secret;
    this.region = cfg.region;

    //s3 bucket
    this.bucket = cfg.bucket;

    //set the maximum document size to be uploaded
    this.maxSize = cfg.maxSize || 10000000;

    //set document to expire in 5 minutes
    this.expiration = cfg.expiration || new Date(new Date().getTime() + 5 * 60 * 1000);
    this.expiration = this.expiration.toISOString();
  }

  createPolicy(params, credential) {
    return {
      expiration: this.expiration,
      conditions: [
        { bucket: this.bucket },
        { acl: "public-read" },
        { success_action_status: "201" },
        ["starts-with", "$key", params.startsWith],
        ["starts-with", "$Content-Type", ""],
        ["content-length-range", 0, this.maxSize],
        { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
        { "x-amz-credential": credential },
        { "x-amz-date": dateString() + "T000000Z" }
      ]
    };
  }

  createSignature(policyBase64) {
    var dateKey = hmac("AWS4" + this.secret, dateString());
    var dateRegionKey = hmac(dateKey, this.region);
    var dateRegionServiceKey = hmac(dateRegionKey, "s3");
    var signingKey = hmac(dateRegionServiceKey, "aws4_request");
    return hmac(signingKey, policyBase64).toString("hex");
  }

  s3Params(params) {
    var credential = [this.access_key, dateString(), this.region, "s3/aws4_request"].join("/");
    var policy = this.createPolicy(params, credential);
    var policyBase64 = new Buffer(JSON.stringify(policy)).toString("base64");
    return {
      acl: "public-read",
      success_action_status: "201",
      policy: policyBase64,
      "content-type": params.contentType,
      "x-amz-algorithm": "AWS4-HMAC-SHA256",
      "x-amz-credential": credential,
      "x-amz-date": dateString() + "T000000Z",
      "x-amz-signature": this.createSignature(policyBase64)
    };
  }

  get(params) {
    return {
      endpoint_url: "https://" + this.bucket + ".s3.amazonaws.com",
      params: this.s3Params(params)
    };
  }
}

module.exports = cfg => {
  return new aws_s3(cfg);
};
