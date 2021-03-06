'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Profile = mongoose.model('Profile'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Profile
 */
exports.create = function(req, res) {
  var profile = new Profile(req.body);
  // profile.user = req.user;
  profile.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(profile);
    }
  });
};

/**
 * Show the current Profile
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var profile = req.profile ? req.profile.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  profile.isCurrentUserOwner = req.user && profile.user && profile.user._id.toString() === req.user._id.toString() ? true : false;

  res.jsonp(profile);
};

/**
 * Update a Profile
 */
exports.update = function(req, res) {
  var profile = req.profile ;
// console.log("req body" + _.map(req.body));
  profile = _.extend(profile , req.body);

  profile.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(profile);
    }
  });
};

/**
 * Delete an Profile
 */
exports.delete = function(req, res) {
  var profile = req.profile ;

  profile.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(profile);
    }
  });
};

/**
 * List of Profiles with query parameters
 */
exports.list = function(req, res) { 
  // console.log('in profiles.server.controller');

  var keys = _.keys(Profile().schema.paths);
  var query = {};
  _.forEach(keys, function(value){
	  var path = "query." + value;
	  var val = _.get(req, path);
	  if (val) {
		  _.set(query, value, val);
	  }
  });
  Profile.find(query).exec(function (err, profiles) {
    if(!err){ 
      res.json(profiles);       
    } else {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }     
  });
}; 

/**
 * Profile middleware
 */
exports.profileByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Profile is invalid'
    });
  }

  Profile.findById(id).populate('user', 'displayName').exec(function (err, profile) {
    if (err) {
      return next(err);
    } else if (!profile) {
      return res.status(404).send({
        message: 'No Profile with that identifier has been found'
      });
    }
    req.profile = profile;
    next();
  });
};
