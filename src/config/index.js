module.exports = {
    kinesis : {
        orderStreamName: process.env.orderStreamName || 'order-events'
    },
    dynamodb: {
        orderTableName: process.env.orderTableName || 'orders'
    },

    ses: {
        thirdPartyEmailAddress: process.env.thirdPartyEmailAddress || 'thirdpartyprovider@grr.la',
        noReplyEmailAddress: process.env.noReplyEmailAddress || 'no-reply-order-serverlessly-system@grr.la'
    }
}