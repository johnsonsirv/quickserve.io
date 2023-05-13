'use-strict'
import * as Kinesis from 'aws-sdk/clients/kinesis'
const kinesis = new Kinesis()

function addToStream({ data, partitionKey, streamName }) {
    const params = {
        Data: JSON.stringify(data),
        PartitionKey: data[partitionKey],
        StreamName: streamName,
    }

    return kinesis.putRecord(params).promise()
}

module.exports = {
    addToStream,
}