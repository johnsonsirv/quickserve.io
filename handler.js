'use strict';
import { handleCreateOrder, orderMapper } from './src/model/order';
import { createAPIGatewayResponse } from './src/utils';

module.exports.createOrder = async (event) => {

  const order = orderMapper(JSON.parse(event.body));

  handleCreateOrder(order).then(() => {
    return createAPIGatewayResponse({ statusCode: 200, message: order })
  }).catch((error) => {
    return createAPIGatewayResponse({ statusCode: 400, message: error });
  });
};
