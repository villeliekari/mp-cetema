const chai = require("chai");
const fetch = require("node-fetch");

//import chai from 'chai';
//import fetch from 'node-fetch';

describe("Test API call", () => {
  it("should return status 200", async () => {
    //if fetch url is incorrect it will return 404 == false assert
    chai.assert.equal(
      await fetch("https://meri.digitraffic.fi/api/v1/locations/latest")
        .then((res) => {
          return res.status;
        })
        .catch((res) => console.log(res)),
      200
    );
  });
});
