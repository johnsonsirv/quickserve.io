'use strict';
import {
  orderLogicFilterOrdersCreated,
  orderLogicGetOrdersFromStream
} from './src/logic/order';
import {
  handleCreateOrder,
  orderMapper,
  handleOrderNotifyThirdPartyProvider
} from './src/model/order';
import { createAPIGatewayResponse } from './src/utils';

module.exports.createOrder = async (event) => {

  const order = orderMapper(JSON.parse(event.body));

  handleCreateOrder(order).then(() => {
    return createAPIGatewayResponse({ statusCode: 200, message: order })
  }).catch((error) => {
    return createAPIGatewayResponse({ statusCode: 400, message: error });
  });
};


module.exports.notifyThirdPartyProvider = async (event) => {
  const records = orderLogicGetOrdersFromStream(event);
  const orders = orderLogicFilterOrdersCreated(records);

  if (orders.length <= 0) return;

  handleOrderNotifyThirdPartyProvider(orders)
    .then(() => { return 'Email Notification Sent' })
    .catch((error) => { return error })
}