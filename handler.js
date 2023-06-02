'use strict';
import {
  orderLogicFilterOrdersCreated,
  orderLogicFilterOrdersFulfilled,
  orderLogicGetOrdersFromStream
} from './src/logic/order';
import {
  handleCreateOrder,
  orderMapper,
  handleNotifyThirdPartyProducer,
  handleFulfilOrderByThirdParty,
  handleNotifyThirdPartyDelivery,
  handleOrderDelivered,
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

module.exports.notifyThirdPartyProviders = async (event) => {
  const records = orderLogicGetOrdersFromStream(event);
  
  const ordersCreated = orderLogicFilterOrdersCreated(records);
  const ordersFulfilled = orderLogicFilterOrdersFulfilled(records);

  // Handle all notifications
  const thirdPartyProducerNotifications = handleNotifyThirdPartyProducer({ orders: ordersCreated })
  const thirdPartyDeliveryNotifications = handleNotifyThirdPartyDelivery({ orders: ordersFulfilled })

  return Promise.all([
    thirdPartyProducerNotifications,
    thirdPartyDeliveryNotifications
  ])
  .then(() => 'All notifications sent')
  .catch((error) => error)
}

module.exports.fulfilOrderByThirdParty = async (event) => {
  const req = JSON.parse(event.body)

  handleFulfilOrderByThirdParty({
    orderId: req.orderId,
    thirdPartyProviderId: req.thirdPartyProviderId,
  })
    .then(() => {
      return createAPIGatewayResponse({
        statusCode: 200,
        message: `Fulfilled Order "${orderId}" sent to delivery!`
      })
    })
    .catch((error) => {
      return createAPIGatewayResponse({ statusCode: 400, message: error })
    })

}

module.exports.notifyExternalDeliveryService =  async () => {
  console.log('HTTP call to external delivery service');

  return 'done'
}

module.exports.deliverOrderByThirdParty = async(event) => {
  const req = JSON.parse(event.body);
  
  handleOrderDelivered({
    orderId: req.orderId,
    thirdPartyDeliveryId: req.thirdPartyDeliveryId,
    orderReview: req.orderReview,
  }).then(() => {
    return createAPIGatewayResponse({ statusCode: 200, message: `Order Delivered by ${req.thirdPartyDeliveryId}` })
  }).catch((error) => {
    return createAPIGatewayResponse({ statusCode: 400, message: error });
  })
}