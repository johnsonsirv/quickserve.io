'use strict';

module.exports.createOrder = async (event) => {

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Hello Create Order handler',
        input: event,
      },
      null,
      2
    ),
  };
};
