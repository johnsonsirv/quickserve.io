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

function getFromDB ({ keyValue, tableName, keyName }) {
    const params = {
        TableName: tableName,
        Key: {
            [keyName]: keyValue
        },
    }

    return dynamodb.get(params)
        .promise()
        .then((data) => data.Item) // TODO: cache this data
}

module.exports = {
    saveToDB,
    getFromDB,
}