// Action Types
import * as actionTypes from "../actions/actionTypes";

// Utilities
import updateObject from "../../utils/updateObject";

const initialState = {
  user: null,
  users: null,
  loading: false,
};

// Sets loading state
const setUserLoad = (state, action) => {
  return updateObject(state, { loading: true });
};

// Unsets loading state
const unsetUserLoad = (state, action) => {
  return updateObject(state, { loading: false });
};

// Sets a searched user
const setSearchedUser = (state, action) => {
  return updateObject(state, {
    user: action.payload,
    loading: false,
  });
};

// Sets all users
const getUsers = (state, action) => {
  return updateObject(state, {
    users: action.payload,
  });
};

// Update current user profile
const updateProfile = (state, action) => {
  let user = Object.assign(state.user);
  user.user.profile = action.payload.profile;
  return updateObject(state, { user });
};

// Add post user object
const createPost = (state, action) => {
  const user = Object.assign(state.user);
  user.posts.unshift(action.payload);
  return updateObject(state, { user });
};

// Remove post from user object
const deletePost = (state, action) => {
  let user = Object.assign(state.user);
  const filteredPosts = user.posts.filter(
    (post) => post._id !== action.payload
  );
  user.posts = filteredPosts;
  return updateObject(state, { user });
};

// Updates a post
const updatePost = (state, action) => {
  let user = Object.assign(state.user);
  const updatedPosts = user.posts.map((post) =>
    post._id === action.payload._id ? action.payload : post
  );
  user.posts = updatedPosts;
  return updateObject(state, { user });
};

// Updates education
const updateEducation = (state, action) => {
  let user = Object.assign(state.user);
  user.user.profile.education = action.payload;
  return updateObject(state, { user });
};

// Updates experience
const updateExperience = (state, action) => {
  let user = Object.assign(state.user);
  user.user.profile.experience = action.payload;
  return updateObject(state, { user });
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_USER_LOAD:
      return setUserLoad(state, action);
    case actionTypes.UNSET_USER_LOAD:
      return unsetUserLoad(state, action);
    case actionTypes.GET_USER:
      return setSearchedUser(state, action);
    case actionTypes.GET_USERS:
      return getUsers(state, action);
    case actionTypes.UPDATE_PROFILE:
      return updateProfile(state, action);
    case actionTypes.CREATE_POST:
      return createPost(state, action);
    case actionTypes.DELETE_POST:
      return deletePost(state, action);
    case actionTypes.UPDATE_POST:
      return updatePost(state, action);
    case actionTypes.UPDATE_EDUCATION:
      return updateEducation(state, action);
    case actionTypes.UPDATE_EXPERIENCE:
      return updateExperience(state, action);
    default:
      return state;
  }
}
