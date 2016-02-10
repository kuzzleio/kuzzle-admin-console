function NotAuthenticatedError(message) {
  this.type = NOT_AUTHENTICATED;
  this.message = (message || '');
}

NotAuthenticatedError.prototype = Error.prototype;
