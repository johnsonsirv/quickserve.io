'use-strict';

const { EVENT_TYPES } = require("../constants");

const parseStreamPayload = (record) => {
    const buffer = new Buffer.from(record.kinesis.data, 'base64');
    return JSON.parse(buffer.toString('utf8'))
}

const orderLogicGetOrdersFromStream = (event) => {
    return event.Records.map(parseStreamPayload);
}

const orderLogicFilterOrdersCreated = (orders) => {
    return (
        orders
            .filter((order) => order.eventType === EVENT_TYPES.ORDER_CREATED)
    )
}

module.exports = {
    orderLogicGetOrdersFromStream,
    orderLogicFilterOrdersCreated,
}