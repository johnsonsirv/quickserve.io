'use-strict';
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
const dynamodb = new DynamoDB.DocumentClient();

function saveToDB({ data, tableName }) {
    const params = {
        TableName: tableName,
        Item: data
    }

    return dynamodb.put(params).promise()
}

module.exports = {
    saveToDB,
}