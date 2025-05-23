// C:\Users\hanos\nextall\backend\src\config\getUser.js

const Users = require("../models/User");
const Shop = require('../models/Shop');

exports.getUser = async (req, requireVerify = true) => {
  if (!req.user) {
    throw new Error("You Must Be Logged In.");
  }
  const user = await Users.findById(req.user._id);
  if (!user) {
    throw new Error("User Not Found.");
  }
  // If requireVerify is false then user must be verified.
  if (!requireVerify && !user.isVerified) {
    throw new Error("User Email Is Not Verified.");
  }
  return user;
};

exports.getAdmin = async (req) => {
  if (!req.user) {
    throw new Error("You Must Be Logged In.");
  }
  const user = await Users.findById(req.user._id);
  if (!user) {
    throw new Error("User Not Found.");
  }
  if (!user.role.includes("admin")) {
    throw new Error("Access Denied.");
  }
  return user;
};

exports.getVendor = async (req) => {
  if (!req.user) {
    throw new Error("You Must Be Logged In.");
  }
  const user = await Users.findById(req.user._id);
  if (!user) {
    throw new Error("User Not Found.");
  }
  if (!user.role.includes("vendor")) {
    throw new Error("Access Denied.");
  }
  return user;
};
