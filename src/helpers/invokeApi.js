/**
 * @Author: guiguan
 * @Date:   2017-04-12T16:04:51+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-12T18:00:20+10:00
 */

import _ from 'lodash';
import request from 'request-promise-native';

function handleError(err) {
  l.error(err.stack);
  throw err;
}

/**
 * Invoke an API with retries. This is double callback bug free.
 *
 * @param {Object} requestOptions - options for Request
 * @param {Object} [options={}] - options for invokeApi
 * @param {Function} [options.shouldRetry=null] - function defines whether to retry with returned value
 * @param {Function} [options.shouldRetryOnError=null] - function defines whether to retry with returned error object
 * @param {Number}  [options.retryDelay=800] - delays among retries
 * @param {Function} [options.errorHandler=handleError] - intermediate error handler
 * @return {Promise} request promise
 */
export default function invokeApi(requestOptions, options = {}) {
  const {
    shouldRetry = null,
    shouldRetryOnError = null,
    retryDelay = 800,
    errorHandler = handleError,
  } = options;
  return new Promise((resolve, reject) => {
    // make sure `invoke` can be only called at most every retryDelay
    const invoke = _.throttle(
      () => {
        request(requestOptions)
          .then((v) => {
            if (shouldRetry && shouldRetry(v)) {
              return _.delay(invoke, retryDelay);
            }
            resolve(v);
          })
          .catch((e) => {
            if (shouldRetryOnError && shouldRetryOnError(e)) {
              return _.delay(invoke, retryDelay);
            }
            if (errorHandler) {
              _.attempt(errorHandler, e);
            }
            reject(e);
          });
      },
      retryDelay,
      {
        leading: true,
        trailing: false,
      },
    );
    invoke();
  });
}
