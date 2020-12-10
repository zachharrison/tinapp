const { assert } = require('chai');

const { findWithEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('findWithEmail', function() {
  it('should return a user with valid email', function() {
    const user = findWithEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });

  it('should return a undefined with an invalid email', function() {
    const user = findWithEmail("userzzzzz@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});