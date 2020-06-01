// Utilities
const factory = require("./handlerFactory");

// Error handling
const catchAsync = require("./../utils/catchAsync");

// Validation
const validateProfileInput = require("../validation/profile/createUpdateProfile");
const validateExperienceInput = require("../validation/profile/addExperience");
const validateEducationInput = require("../validation/profile/addEducation");

// Models
const User = require("../models/userModel");
const Profile = require("../models/profileModel");

////////////////
// Public Routes

// @route   GET api/v1/profiles/test
// @desc    Tests profiles route
// @access  Public
exports.test = (req, res, next) => {
  res.json({ message: "Profiles route secured" });
};

// @route   GET api/v1/profiles
// @desc    Return all profiles
// @access  Public
exports.getAllProfiles = factory.getAll(Profile);

// @route   GET api/v1/profiles/profile/:id
// @desc    Returns profile by id
// @access  Public
exports.getProfileById = factory.getOne(Profile);

///////////////////
// Protected Routes

// @route   POST api/v1/profiles/currentUser
// @desc    Create current user's profile
// @access  Protected
exports.createCurrentUserProfile = catchAsync(async (req, res, next) => {
  // Validate Inputs
  const { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) return res.status(400).json(errors);

  // Check if user has already created a profile
  const profileCheck = await Profile.findOne({ _id: req.user.profile });
  if (profileCheck) {
    errors.alreadyCreated = "User has already created a profile";
    return res.status(400).json({ errors });
  }

  // Check if handle is already taken
  const handleCheck = await Profile.findOne({ handle: req.body.handle });
  if (handleCheck) {
    errors.handle = "Handle is already taken";
    return res.status(400).json(errors);
  }

  // Format profile body
  const profileBody = {
    user: req.user._id,
    handle: req.body.handle,
    status: req.body.status,
    skills: req.body.skills,
    bio: req.body.bio ? req.body.bio : "",
    githubusername: req.body.githubusername ? req.body.githubusername : "",
    social: {
      youtube: req.body.youtube ? req.body.youtube : "",
      twitter: req.body.twitter ? req.body.twitter : "",
      facebook: req.body.facebook ? req.body.facebook : "",
      linkedin: req.body.linkedin ? req.body.linkedin : "",
      instagram: req.body.instagram ? req.body.instagram : "",
    },
  };

  // Create the new profile
  const newProfile = await new Profile(profileBody).save();

  // Add the new profile's id to the current user's document
  await User.findOneAndUpdate(
    { _id: req.user.id },
    { profile: newProfile._id }
  );

  // Retrieve the updated user document with the profile
  const updatedUser = await User.findOne({ _id: req.user.id });

  // Create JWT with updated user information (new profile)
  const token = createJWT(updatedUser);

  // Respond
  return res.status(201).json({ status: "success", token });
});

// @route   PATCH api/v1/profiles/currentUser
// @desc    Update current user's profile
// @access  Protected
exports.updateCurrentUserProfile = catchAsync(async (req, res, next) => {
  // Validate Inputs
  const { errors, isValid } = validateProfileInput(req.body);
  if (!isValid) return res.status(400).json(errors);

  // Find current user's profile document
  const profile = await Profile.findOne({ user: req.user.id });

  // Check if handle has been taken by another user
  const handleCheck = await Profile.findOne({ handle: req.body.handle });
  if (handleCheck && handleCheck.user.toString() !== profile.user.toString()) {
    errors.handle = "Handle is already taken";
    return res.status(400).json(errors);
  }

  // Format profile body
  const profileBody = {
    user: req.user._id,
    handle: req.body.handle,
    status: req.body.status,
    skills: req.body.skills,
    bio: req.body.bio ? req.body.bio : "",
    githubusername: req.body.githubusername ? req.body.githubusername : "",
    social: {
      youtube: req.body.youtube ? req.body.youtube : "",
      twitter: req.body.twitter ? req.body.twitter : "",
      facebook: req.body.facebook ? req.body.facebook : "",
      linkedin: req.body.linkedin ? req.body.linkedin : "",
      instagram: req.body.instagram ? req.body.instagram : "",
    },
  };

  // Update the current user's profile
  await profile.update({ $set: profileBody }, { new: true });

  // Find the updated profile in order to populate required fields for front end
  const updatedProfile = await Profile.findOne({ user: req.user.id });

  // Respond
  return res.status(200).json(updatedProfile);
});

// @route   POST api/v1/profiles/education
// @desc    Add education to profile
// @access  Protected
exports.addEducation = catchAsync(async (req, res, next) => {
  // Validate Inputs
  const { errors, isValid } = validateEducationInput(req.body);
  if (!isValid) return res.status(400).json(errors);

  // Find current user's profile
  const profile = await Profile.findOne({ user: req.user.id });

  // Add education object to profile document array
  profile.education.unshift(req.body);

  // Save and respond
  await profile.save();
  res.status(200).json(profile);
});

// @route   DELETE api/v1/profiles/education/:id
// @desc    Delete education from profile
// @access  Protected
exports.deleteEducation = catchAsync(async (req, res, next) => {
  // Find current user profile
  const profile = await Profile.findOne({ user: req.user.id });

  // Determine index of education to remove
  const removeIndex = profile.education
    .map((item) => item.id)
    .indexOf(req.params.id);

  // Remove education object from profile document array
  profile.education.splice(removeIndex, 1);

  // Save and respond
  await profile.save();
  res.status(200).json(profile);
});

// @route   POST api/v1/profiles/experience
// @desc    Add experience to profile
// @access  Protected
exports.addExperience = catchAsync(async (req, res, next) => {
  // Validate Inputs
  const { errors, isValid } = validateExperienceInput(req.body);
  if (!isValid) return res.status(400).json(errors);

  // Find current user's profile
  const profile = await Profile.findOne({ user: req.user.id });

  // Add experience object to profile document array
  profile.experience.unshift(req.body);

  // Save and respond
  await profile.save();
  res.status(200).json(profile);
});

// @route   DELETE api/v1/profiles/experience/:id
// @desc    Delete experience from profile
// @access  Protected
exports.deleteExperience = catchAsync(async (req, res, next) => {
  // Find current user profile
  const profile = await Profile.findOne({ user: req.user.id });

  // Determine index of experience to remove
  const removeIndex = profile.experience
    .map((item) => item.id)
    .indexOf(req.params.id);

  // Remove experience object from profile document array
  profile.experience.splice(removeIndex, 1);

  // Save and respond
  await profile.save();
  res.status(200).json(profile);
});

/////////////////////
// Restricted Routes

// @route   PATCH api/v1/profiles/profile/:id
// @desc    Update profile by id
// @access  Restricted
exports.updateProfileById = factory.updateOne(Profile);

// @route   DELETE api/v1/profiles/profile/:id
// @desc    Delete profile by id
// @access  Restricted
exports.deleteProfileById = factory.deleteOne(Profile);
